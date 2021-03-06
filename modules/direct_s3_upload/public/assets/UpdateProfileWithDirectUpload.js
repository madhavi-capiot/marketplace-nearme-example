const qa = s => Array.prototype.slice.call(document.querySelectorAll(s));
const q = s => document.querySelector(s);
// prettier-ignore
const getXMLText = (data, key) => $(data).find(key).text() || '';

class FileUpload {
  constructor({ name }) {
    this.name = name;

    this.fileInput = q(`[data-s3-direct-upload-field-input="${this.name}"]`);
    this.presignFields = qa('[data-s3-direct-upload-field="presign"]');

    this.form = $(this.fileInput).closest('form');
    this.action = this.form.find('[name="action"]').val(); // get url from hidden input named action
    this.fileUrl = q(`[data-s3-direct-upload-field-file-url="${this.name}"]`);
    this.progress = this.form.find(`[data-s3-direct-upload-progress="${this.name}"]`);
    this.previewContainer = this.form.find(`[data-s3-direct-upload-field-preview="${this.name}"]`);

    this.attachEventHandlers();
  }

  attachEventHandlers() {
    $(this.fileInput).on('change', this.onFileChange.bind(this));
  }

  onFileChange() {
    this.sendForm()
      .done(data => (this.fileUrl.value = getXMLText(data, 'Location'))) // save path to uploaded file in db
      .done(() => this.fileInput.setAttribute('disabled', 'disabled')) // do not submit files in form
      .done(this.updatePreview.bind(this)) // update preview to show what has been uploaded to s3
      .always(() => (this.showProgressBar = false));
  }

  sendForm() {
    return $.ajax({
      type: 'post',
      url: this.action,
      contentType: false,
      processData: false,
      beforeSend: () => (this.showProgressBar = true),
      data: this.formData
    });
  }

  get formData() {
    const formdata = new FormData();
    this.presignFields.forEach(field => formdata.append(field.name, field.value));
    formdata.append(this.fileInput.name, this.fileInput.files[0], this.fileName);
    return formdata;
  }

  set showProgressBar(showOrHide) {
    this.progress.toggleClass('invisible', !showOrHide);
  }

  updatePreview(data) {
    const imageUrl = getXMLText(data, 'Location');

    const previewHtml = `
      <figure class="figure mr-3">
        <p class="text-muted">Newly uploaded ${this.name}</p>
        <a href="${imageUrl}" target="_blank">
          <img src="${imageUrl}" class="figure-img img-fluid rounded" width="200">
        </a>
        <figcaption class="figure-caption">
          Name: ${this.fileName}
          <br/>
          Size: ${this.fileSize} bytes
        </figcaption>
      </figure>
    `;

    this.previewContainer.append(previewHtml);
  }

  get fileName() {
    // prettier-ignore
    return this.fileInput.value.split('/').pop().split('\\').pop();
  }

  get fileSize() {
    return this.fileInput.files[0].size;
  }
}

// Initialize fileupload class for avatar and banner images
new FileUpload({ name: 'avatar' });
new FileUpload({ name: 'banner' });
