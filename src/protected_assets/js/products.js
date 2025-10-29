function productPanel() {
  return {
    products: [],
    search: '',
    selectedProduct: null, // For the new view modal
    pagination: {}, // هنخزن معلومات الـ pagination هنا
    currentPage: 1, // هنتتبع الصفحة الحالية
    pageNumbers: [],
    productId: null,
    editMode: false,
    baseUrl: "<%= req.protocol + '://' + req.get('host') %>",
    defaultPreviewImages: [],
    form: {
      name: { en: '', he: '' },
      description: { en: '', he: '' },
      price: '',
      stock: '',
      category: '',
      thumbnail: '',
      images: [],
      colors: [],
    },

    // Fetch products (with pagination)
    async fetchProducts(page = 1) {
      try {
        // ✨ الجديد: استخدام URLSearchParams لبناء الـ URL
        const url = new URL(`/admin/api/products`, window.location.origin);
        url.searchParams.append('page', page);

        // ضيف كلمة البحث *فقط* لو هي مش فاضية
        if (this.search.trim()) {
          url.searchParams.append('search', this.search);
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');

        const response = await res.json();
        this.products = response.data.products;
        this.pagination = response.data.pagination;
        this.currentPage = response.data.pagination.currentPage;

        this.updatePageNumbers();
        if (this.currentPage > this.pagination.totalPages) {
          this.currentPage = this.pagination.totalPages || 1;
          this.fetchProducts(this.currentPage);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    },
    // Reset form
    resetForm() {
      this.form = {
        name: { en: '', he: '' },
        description: { en: '', he: '' },
        price: '',
        stock: '',
        category: '',
        thumbnail: '',
        images: [],
        colors: [],
      };

      this.defaultPreviewImages = [];
      this.editMode = false;
      this.productId = null;
    },

    // --- Modal Triggers ---
    openAddModal() {
      this.resetForm();
      this.$refs.addEditModal.showModal(); // Use daisyUI method
    },

    openEditModal(product) {
      this.resetForm();
      this.editMode = true;
      this.productId = product._id;

      // الاسم والوصف
      this.form.name = { ...product.name };
      this.form.description = { ...product.description };
      this.form.price = product.price || '';
      this.form.stock = product.stock || '';
      this.form.category = product.category || '';

      // ✅ Thumbnail preview
      this.form.thumbnail = null;
      this.thumbnailPreview = product.thumbnail || '';

      // ✅ الصور القديمة (main images)
      this.existingImages = [...(product.images || [])];
      this.defaultPreviewImages = [...this.existingImages];

      // ✅ الألوان
      this.form.colors =
        product.colors?.map((c) => ({
          name: c.name,
          hex: c.hex,
          images: [],
          preview: [],
          existing: c.images || [],
        })) || [];

      this.$refs.addEditModal.showModal();
    },

    // NEW: Open View Modal
    openViewModal(product) {
      this.selectedProduct = product;
      this.$refs.viewModal.showModal(); // Use daisyUI method
    },

    confirmDelete(id) {
      this.productId = id;
      this.$refs.deleteModal.showModal(); // Use daisyUI method
    },

    // --- Form/Color Logic ---
    addColor() {
      this.form.colors.push({
        name: '',
        hex: '#ACA59B', // Default to your secondary color
        images: [],
        preview: [],
      });
    },

    removeColor(index) {
      this.form.colors.splice(index, 1);
    },

    handleDefaultFiles(e) {
      const files = Array.from(e.target.files);
      this.form.images.push(...files);
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      this.defaultPreviewImages.push(...newPreviews);
    },

    handleColorFiles(index, e) {
      const files = Array.from(e.target.files);
      this.form.colors[index].images = files;
      this.form.colors[index].preview = files.map((f) =>
        URL.createObjectURL(f)
      );
    },

    handleThumbnailFile(e) {
      const file = e.target.files[0];
      this.form.thumbnail = file;
      this.thumbnailPreview = URL.createObjectURL(file);
    },

    removeImage(index) {
      // احذف الصورة من الـ preview
      this.defaultPreviewImages.splice(index, 1);

      // لو الصورة دي من القديمة احذفها من existingImages
      if (this.existingImages[index]) {
        this.existingImages.splice(index, 1);
      } else {
        // لو دي كانت جديدة (file object)
        this.form.images.splice(index - this.existingImages.length, 1);
      }
    },

    handleThumbnailFile(e) {
      const file = e.target.files[0];
      this.form.thumbnail = file;
      this.thumbnailPreview = URL.createObjectURL(file);
    },
    removeThumbnail() {
      this.thumbnailPreview = '';
      this.form.thumbnail = null;
    },

    removeColorImage(colorIndex, imgIndex) {
      const color = this.form.colors[colorIndex];

      if (color.existing && color.existing[imgIndex]) {
        color.existing.splice(imgIndex, 1);
      } else if (color.preview && color.preview[imgIndex]) {
        color.preview.splice(imgIndex, 1);
        color.images.splice(imgIndex, 1);
      }
    },

    // --- API Calls ---
    async submitForm() {
      const formData = new FormData();

      // Append simple fields
      formData.append('name', JSON.stringify(this.form.name));
      formData.append('description', JSON.stringify(this.form.description));

      formData.append('price', this.form.price);
      formData.append('stock', this.form.stock);
      formData.append('category', this.form.category);
      // 🖼️ Thumbnail logic
      if (
        this.thumbnailPreview &&
        typeof this.thumbnailPreview === 'string' &&
        !this.thumbnailPreview.startsWith('blob:')
      ) {
        formData.append('thumbnailOld', this.thumbnailPreview);
      }
      if (this.form.thumbnail) {
        formData.append('thumbnail', this.form.thumbnail);
      }

      // 1️⃣ الصور القديمة اللي لسه موجودة
      // 1️⃣ الصور القديمة فقط (نستبعد blob URLs)
      const oldImages = this.defaultPreviewImages.filter(
        (img) => typeof img === 'string' && !img.startsWith('blob:')
      );

      // 2️⃣ ابعتهم كـ JSON في formData
      formData.append('imagesOld', JSON.stringify(oldImages));

      // 3️⃣ الصور الجديدة (File objects)
      this.form.images.forEach((img) => {
        formData.append('images', img);
      });

      // 🎨 Append color data (names, hex, old + new images)
      const colorMeta = this.form.colors.map((color, index) => {
        // 1️⃣ أرسل بيانات اللون الأساسية
        const data = {
          name: color.name,
          hex: color.hex,
        };

        // 2️⃣ أرسل الصور القديمة اللي فضلها المستخدم
        const keptOld = (color.existing || []).filter(
          (img) => typeof img === 'string' && !img.startsWith('blob:')
        );
        formData.append(`colorsOld_${index}`, JSON.stringify(keptOld));

        // 3️⃣ أرسل الصور الجديدة
        (color.images || []).forEach((imgFile) => {
          formData.append(`colorImages_${index}`, imgFile);
        });

        return data;
      });

      // 4️⃣ في الآخر، أرسل الـ JSON نفسه (الاسم والـ hex)
      formData.append('colors', JSON.stringify(colorMeta));
      const url = this.editMode
        ? `/admin/api/products/${this.productId}`
        : `/admin/api/products`;
      const method = this.editMode ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, { method, body: formData });
        if (!res.ok) throw new Error('Form submission failed');

        this.$refs.addEditModal.close(); // Close modal on success
        this.fetchProducts(); // Refresh table
      } catch (error) {
        console.error('Failed to submit form:', error);
      }
    },

    async deleteProduct() {
      try {
        await fetch(`/admin/api/products/${this.productId}`, {
          method: 'DELETE',
        });
        this.$refs.deleteModal.close(); // Close modal on success
        this.fetchProducts(); // Refresh table
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    },

    nextPage() {
      if (this.pagination.hasNextPage) {
        this.fetchProducts(this.currentPage + 1);
      }
    },

    prevPage() {
      if (this.pagination.hasPrevPage) {
        this.fetchProducts(this.currentPage - 1);
      }
    },

    goToPage(page) {
      // لو ضغط على "..." أو نفس الصفحة الحالية، متعملش حاجة
      if (typeof page !== 'number' || page === this.currentPage) return;
      this.fetchProducts(page);
    },

    // دالة لحساب أرقام الصفحات اللي هتظهر
    updatePageNumbers() {
      const total = this.pagination.totalPages;
      const current = this.pagination.currentPage;
      const range = [];
      const delta = 2; // عدد الصفحات اللي تظهر قبل وبعد الحالية

      // لو الصفحات قليلة، اظهرهم كلهم
      if (total <= 7) {
        this.pageNumbers = Array.from({ length: total }, (_, i) => i + 1);
        return;
      }

      // أضف أول وآخر صفحة دايمًا
      range.push(1);

      // أضف "..." بعد الأولى لو الفارق كبير
      if (current - delta > 2) {
        range.push('...');
      }

      // الصفحات حول الحالية
      for (
        let i = Math.max(2, current - delta);
        i <= Math.min(total - 1, current + delta);
        i++
      ) {
        range.push(i);
      }

      // أضف "..." قبل الأخيرة لو في مسافة
      if (current + delta < total - 1) {
        range.push('...');
      }

      // أضف آخر صفحة
      range.push(total);

      this.pageNumbers = range;
    },
    // Init
    init() {
      this.fetchProducts(this.currentPage);
      this.$watch('search', () => {
        this.fetchProducts(1);
      });
    },
  };
}
