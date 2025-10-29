function loginForm() {
  return {
    username: '',
    password: '',
    showPassword: false,
    loading: false,
    error: '',
    async submitForm() {
      this.error = '';
      this.loading = true;
      try {
        const res = await fetch('/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'حدث خطأ ما');
        window.location.href = '/admin/dashboard';
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
  };
}
