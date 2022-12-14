/**
 * Tool for creating image Blocks for Editor.js
 * Made with «Creating a Block Tool» tutorial {@link https://editorjs.io/creating-a-block-tool}
 *
 * @typedef {object} ImageToolData — Input/Output data format for our Tool
 * @property {string} url - image source URL
 * @property {string} caption - image caption
 * @property {boolean} withBorder - flag for adding a border
 * @property {boolean} withBackground - flag for adding a background
 * @property {boolean} stretched - flag for stretching image to the full width of content
 *
 * @typedef {object} ImageToolConfig
 * @property {string} placeholder — custom placeholder for URL field
 */
class SimpleImage {
  /**
   * Our tool should be placed at the Toolbox, so describe an icon and title
   */
  static get toolbox() {
    return {
      title: 'GIF',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
    };
  }
  compId = Math.floor(Math.random() * 999999999) + 1;
  giffs = [];
  selectedImage = {};
  selectedImages = [];
  page = 0;
  /**
   * Allow render Image Blocks by pasting HTML tags, files and URLs
   * @see {@link https://editorjs.io/paste-substitutions}
   * @return {{tags: string[], files: {mimeTypes: string[], extensions: string[]}, patterns: {image: RegExp}}}
   */


  /**
   * Automatic sanitize config
   * @see {@link https://editorjs.io/sanitize-saved-data}
   */
  static get sanitize() {
    return {
      url: {},
      caption: {
        b: true,
        a: {
          href: true
        },
        i: true
      }
    }
  }

  /**
   * Tool class constructor
   * @param {ImageToolData} data — previously saved data
   * @param {object} api — Editor.js Core API {@link  https://editorjs.io/api}
   * @param {ImageToolConfig} config — custom config that we provide to our tool's user
   */
  constructor({ data, api, config }) {
    this.api = api;
    this.config = config || {};
    this.data = {
      url: data.url || '',
      caption: data.caption || '',
      withBorder: data.withBorder !== undefined ? data.withBorder : false,
      withBackground: data.withBackground !== undefined ? data.withBackground : false,
      stretched: data.stretched !== undefined ? data.stretched : false,
    };

    this.wrapper = undefined;
    this.settings = [
      {
        name: 'withBorder',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.8 10.592v2.043h2.35v2.138H15.8v2.232h-2.25v-2.232h-2.4v-2.138h2.4v-2.28h2.25v.237h1.15-1.15zM1.9 8.455v-3.42c0-1.154.985-2.09 2.2-2.09h4.2v2.137H4.15v3.373H1.9zm0 2.137h2.25v3.325H8.3v2.138H4.1c-1.215 0-2.2-.936-2.2-2.09v-3.373zm15.05-2.137H14.7V5.082h-4.15V2.945h4.2c1.215 0 2.2.936 2.2 2.09v3.42z"/></svg>`
      },
      {
        name: 'stretched',
        icon: `<svg width="17" height="10" viewBox="0 0 17 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.568 5.925H4.056l1.703 1.703a1.125 1.125 0 0 1-1.59 1.591L.962 6.014A1.069 1.069 0 0 1 .588 4.26L4.38.469a1.069 1.069 0 0 1 1.512 1.511L4.084 3.787h9.606l-1.85-1.85a1.069 1.069 0 1 1 1.512-1.51l3.792 3.791a1.069 1.069 0 0 1-.475 1.788L13.514 9.16a1.125 1.125 0 0 1-1.59-1.591l1.644-1.644z"/></svg>`
      },
      {
        name: 'withBackground',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.043 8.265l3.183-3.183h-2.924L4.75 10.636v2.923l4.15-4.15v2.351l-2.158 2.159H8.9v2.137H4.7c-1.215 0-2.2-.936-2.2-2.09v-8.93c0-1.154.985-2.09 2.2-2.09h10.663l.033-.033.034.034c1.178.04 2.12.96 2.12 2.089v3.23H15.3V5.359l-2.906 2.906h-2.35zM7.951 5.082H4.75v3.201l3.201-3.2zm5.099 7.078v3.04h4.15v-3.04h-4.15zm-1.1-2.137h6.35c.635 0 1.15.489 1.15 1.092v5.13c0 .603-.515 1.092-1.15 1.092h-6.35c-.635 0-1.15-.489-1.15-1.092v-5.13c0-.603.515-1.092 1.15-1.092z"/></svg>`
      }
    ];
  }

  /**
   * Return a Tool's UI
   * @return {HTMLElement}
   */
  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('simple-image');
    this.wrapper.contentEditable = true;

    if (this.data && this.data.url) {
      this._createImage(this.data.url, this.data.caption,this.data.id);
      return this.wrapper;
    }

    this.config.openModal(this.compId)
    $('#chooseBtn' + this.compId).click(this.chooseHandler);
    $('#searchBtn' + this.compId).click(this.searchHandler);
    $('#searchBox' + this.compId).keydown(this.searchHandler);
    $('body').on('click', '.clickableimage', this.imageClick);

    console.log(this.wrapper)
    return this.wrapper;
  }

  chooseHandler = () => {
    if(this.selectedImages?.length){
      for(const img of this.selectedImages){
        this._createImage(img.images.original.url, img.title,img.id);
        document.getElementById(this.compId).style.display = 'none';
      }
    }
    
  }

  searchHandler = ($event) => {
    if ($event.currentTarget.id == 'searchBtn' + this.compId){
      this.page = 0;
      this.giffs=[];
    }
      
    if ($('#searchBox' + this.compId).val())
      $.get("http://localhost:3000/giffs/" + $('#searchBox' + this.compId).val() + '/' + this.page, this.ajaxHandler);
  }

  searchURLhHandler = ($event) => {
      console.log($event,api);
      // $.get("http://localhost:3000/giffs/" );
  }

  ajaxHandler = (data, status) => {
    if (status == 'success') {
      this.giffs.push(...data.data)
      let giffModalContainer = ''
      for (const giff of data.data) {

        giffModalContainer += `<div class='col-sm-2' style='margin-bottom:10px'>
      <img id="${giff.id}" class='clickableimage' style='max-height:100px' imgType='thumbnails' src="${giff.images.fixed_width_small.url}" alt="${giff.title}">
      </div>`
      }
      if (data.pagination.count < data.pagination.total_count) {
        let loadMoreDiv = `<div class='col-sm-12' style='margin-bottom:10px; text-align:center'>
      
        <button type="button" style="width:50%" class="btn btn-default"  id="load-more-btn${this.compId}">Load more</button>
        </div>`;
        $("#load-more-div" + this.compId).html(loadMoreDiv);
      }
      else {
        $("#load-more-div" + this.compId).html('');
      }

      if (this.page == 0) {
        $("#giff-content" + this.compId).html(giffModalContainer);
      }
      else {
        $("#giff-content" + this.compId).append(giffModalContainer);
      }

      if (data.pagination.count < data.pagination.total_count) {
        $('#load-more-btn' + this.compId).click(this.searchHandler);
      }
      this.page++;
    }
  }

  imageClick = (event) => {

    if (this.selectedImages?.find(img=>img.id=== event.currentTarget.id)){
      $("#" + this.selectedImage.id).removeClass("selected");
      this.selectedImages =this.selectedImages?.filter(img=>img.id!==this.selectedImage?.id)
    }else{
      this.selectedImage = this.giffs.find(a => a.id == event.currentTarget.id);
      $("#" + event.currentTarget.id).addClass("selected");
      if(!this.selectedImages?.find(img=>img.id===this.selectedImage?.id) && this.selectedImage?.id){
        this.selectedImages.push(this.selectedImage);
      }
    }
  }

  /**
   * @private
   * Create image with caption field
   * @param {string} url — image source
   * @param {string} captionText — caption value
   */
  _createImage(url, captionText,id) {
    const image = document.createElement('img');
    image.setAttribute('id',id);

    const caption = document.createElement('div');

    image.src = url;
    caption.contentEditable = true;
    caption.innerHTML = captionText || '';

    const wrap =document.createElement('div');
    wrap.classList.add('content-gif');

    wrap.appendChild(image);
    wrap.appendChild(caption);
    this.wrapper.appendChild(wrap);

    this._acceptTuneView();
  }

  /**
   * Extract data from the UI
   * @param {HTMLElement} blockContent — element returned by render method
   * @return {SimpleImageData}
   */
  save(blockContent) {
    const data=[];
      const images = blockContent.querySelectorAll('img');
      const captions = blockContent.querySelectorAll('[contenteditable]');
      images.forEach((im,i)=>{
       const d= Object.assign(this.data, {
          url: im.src,
          caption: captions[i].innerHTML || '',
          id:im.id,
        });
        let clone = {}; 
        for (let key in d) {
          clone[key] = d[key];
        }
       data.push(clone)

      })
    return data;
  }

  /**
   * Skip empty blocks
   * @see {@link https://editorjs.io/saved-data-validation}
   * @param {ImageToolConfig} savedData
   * @return {boolean}
   */
  validate(savedData) {
    if (!savedData?.length>0) {
      return false;
    }

    return true;
  }

  /**
   * Making a Block settings: 'add border', 'add background', 'stretch to full width'
   * @see https://editorjs.io/making-a-block-settings — tutorial
   * @see https://editorjs.io/tools-api#rendersettings - API method description
   * @return {HTMLDivElement}
   */
  renderSettings() {
    const wrapper = document.createElement('div');

    this.settings.forEach(tune => {
      let button = document.createElement('div');

      button.classList.add(this.api.styles.settingsButton);
      button.classList.toggle(this.api.styles.settingsButtonActive, this.data[tune.name]);
      button.innerHTML = tune.icon;
      wrapper.appendChild(button);

      button.addEventListener('click', () => {
        this._toggleTune(tune.name);
        button.classList.toggle(this.api.styles.settingsButtonActive);
      });

    });

    return wrapper;
  }

  /**
   * @private
   * Click on the Settings Button
   * @param {string} tune — tune name from this.settings
   */
  _toggleTune(tune) {
    this.data[tune] = !this.data[tune];
    this._acceptTuneView();
  }

  /**
   * Add specified class corresponds with activated tunes
   * @private
   */
  _acceptTuneView() {
    this.settings.forEach(tune => {
      this.wrapper.classList.toggle(tune.name, !!this.data[tune.name]);

      if (tune.name === 'stretched') {
        this.api.blocks.stretchBlock(this.api.blocks.getCurrentBlockIndex(), !!this.data.stretched);
      }
    });
  }

}