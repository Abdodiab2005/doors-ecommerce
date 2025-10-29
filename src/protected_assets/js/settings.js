function imageInput(initial = '') {
  return {
    // تغيير: استخدام placeholder أفضل في حالة عدم وجود صورة
    preview:
      initial || 'https://placehold.co/200x200/e2e8f0/94a3b8?text=Preview',
    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) {
        this.preview =
          initial || 'https://placehold.co/200x200/e2e8f0/94a3b8?text=Preview';
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.preview = ev.target.result;
      };
      reader.readAsDataURL(file);
    },
  };
}
