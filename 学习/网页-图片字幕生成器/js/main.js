class ImageCaptionGenerator {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.settings = {
            captionText: '',
            fontSize: 32,
            fontFamily: 'Microsoft YaHei',
            textColor: '#ffffff',
            bgType: 'color',
            bgColor: '#000000',
            bgOpacity: 0.75,
            bgImage: null,
            captionWidth: 0.9,
            bottomPadding: 0,
            lineHeight: 1.4,
            textAlign: 'center',
            exportFormat: 'png',
            exportQuality: 0.9
        };
        
        // 防抖定时器
        this.debounceTimer = null;
        
        this.initElements();
        this.initEventListeners();
        this.syncUIWithSettings();
    }

    initElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.canvasContainer = document.getElementById('canvasContainer');
        this.captionText = document.getElementById('captionText');
        this.fontSize = document.getElementById('fontSize');
        this.fontSizeValue = document.getElementById('fontSizeValue');
        this.fontFamily = document.getElementById('fontFamily');
        this.textColor = document.getElementById('textColor');
        this.textColorValue = document.getElementById('textColorValue');
        this.bgType = document.getElementById('bgType');
        this.bgColor = document.getElementById('bgColor');
        this.bgColorValue = document.getElementById('bgColorValue');
        this.bgImageGroup = document.getElementById('bgImageGroup');
        this.bgOpacity = document.getElementById('bgOpacity');
        this.bgOpacityValue = document.getElementById('bgOpacityValue');
        this.captionWidth = document.getElementById('captionWidth');
        this.captionWidthValue = document.getElementById('captionWidthValue');
        this.bottomPadding = document.getElementById('bottomPadding');
        this.bottomPaddingValue = document.getElementById('bottomPaddingValue');
        this.lineHeight = document.getElementById('lineHeight');
        this.lineHeightValue = document.getElementById('lineHeightValue');
        this.exportFormat = document.getElementById('exportFormat');
        this.exportQuality = document.getElementById('exportQuality');
        this.exportQualityValue = document.getElementById('exportQualityValue');
        this.qualityControl = document.getElementById('qualityControl');
        this.alignBtns = document.querySelectorAll('.align-btn');
        this.templateBtns = document.querySelectorAll('.template-btn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.alignBtns = document.querySelectorAll('.align-btn');
        this.templateBtns = document.querySelectorAll('.template-btn');
    }

    initEventListeners() {
        this.uploadArea.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        this.captionText.addEventListener('input', () => this.updateSettingsDebounced('captionText', this.captionText.value));
        this.fontSize.addEventListener('input', () => this.updateSettings('fontSize', parseInt(this.fontSize.value)));
        this.fontFamily.addEventListener('change', () => this.updateSettings('fontFamily', this.fontFamily.value));
        this.textColor.addEventListener('input', () => this.updateSettings('textColor', this.textColor.value));
        this.bgType.addEventListener('change', () => {
            this.updateSettings('bgType', this.bgType.value);
            this.toggleBgImageGroup();
        });
        this.bgColor.addEventListener('input', () => this.updateSettings('bgColor', this.bgColor.value));
        this.bgOpacity.addEventListener('input', () => this.updateSettings('bgOpacity', parseInt(this.bgOpacity.value) / 100));
        this.captionWidth.addEventListener('input', () => this.updateSettings('captionWidth', parseInt(this.captionWidth.value) / 100));
        this.bottomPadding.addEventListener('input', () => this.updateSettings('bottomPadding', parseInt(this.bottomPadding.value)));
        this.lineHeight.addEventListener('input', () => this.updateSettings('lineHeight', parseInt(this.lineHeight.value) / 100));
        this.exportFormat.addEventListener('change', () => this.updateSettings('exportFormat', this.exportFormat.value));
        this.exportQuality.addEventListener('input', () => this.updateSettings('exportQuality', parseInt(this.exportQuality.value) / 100));

        this.alignBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleAlignmentChange(btn));
        });

        this.templateBtns.forEach(btn => {
            btn.addEventListener('click', () => this.applyTemplate(btn.dataset.template));
        });

        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.resetBtn.addEventListener('click', () => this.resetSettings());
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!this.isValidImageFile(file)) {
            alert('请上传有效的图片文件（支持 JPG、PNG、GIF、WebP 格式）');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.showCanvas();
                this.render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    toggleBgImageGroup() {
        // 隐藏背景图片选择组，因为现在使用主图片作为背景
        this.bgImageGroup.style.display = 'none';
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        this.uploadArea.classList.remove('dragover');

        const file = event.dataTransfer.files[0];
        if (file) {
            this.imageInput.files = event.dataTransfer.files;
            this.handleImageUpload({ target: { files: [file] } });
        }
    }

    isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return validTypes.includes(file.type);
    }

    showCanvas() {
        this.uploadArea.style.display = 'none';
        this.canvasContainer.style.display = 'flex';
    }

    updateSettingsDebounced(key, value, delay = 100) {
        // 清除之前的定时器
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // 设置新的定时器
        this.debounceTimer = setTimeout(() => {
            this.updateSettings(key, value);
        }, delay);
    }

    updateSettings(key, value) {
        this.settings[key] = value;

        switch(key) {
            case 'fontSize':
                this.fontSizeValue.textContent = value + 'px';
                break;
            case 'textColor':
                this.textColorValue.textContent = value;
                break;
            case 'bgColor':
                this.bgColorValue.textContent = value;
                break;
            case 'bgOpacity':
                this.bgOpacityValue.textContent = Math.round(value * 100) + '%';
                break;
            case 'captionWidth':
                this.captionWidthValue.textContent = Math.round(value * 100) + '%';
                break;
            case 'bottomPadding':
                this.bottomPaddingValue.textContent = value + 'px';
                break;
            case 'lineHeight':
                this.lineHeightValue.textContent = Math.round(value * 100) + '%';
                break;
            case 'exportQuality':
                this.exportQualityValue.textContent = Math.round(value * 100) + '%';
                break;
            case 'exportFormat':
                this.qualityControl.style.display = value === 'jpeg' ? 'block' : 'none';
                break;
        }

        this.render();
    }

    handleAlignmentChange(btn) {
        this.alignBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateSettings('textAlign', btn.dataset.align);
    }

    applyTemplate(template) {
        const templates = {
            '模板1': {
                fontSize: 28,
                textColor: '#ffffff',
                bgColor: '#000000',
                bgOpacity: 0.8,
                textAlign: 'center'
            },
            '模板2': {
                fontSize: 36,
                textColor: '#ffffff',
                bgColor: '#333333',
                bgOpacity: 0.9,
                textAlign: 'left'
            },
            '模板3': {
                fontSize: 24,
                textColor: '#000000',
                bgColor: '#ffffff',
                bgOpacity: 0.95,
                textAlign: 'center'
            }
        };

        if (templates[template]) {
            Object.keys(templates[template]).forEach(key => {
                this.updateSettings(key, templates[template][key]);
                this.syncUIWithSettings(key, templates[template][key]);
            });
        }
    }

    syncUIWithSettings(key, value) {
        switch(key) {
            case 'fontSize':
                this.fontSize.value = value;
                this.fontSizeValue.textContent = value + 'px';
                break;
            case 'textColor':
                this.textColor.value = value;
                this.textColorValue.textContent = value;
                break;
            case 'bgColor':
                this.bgColor.value = value;
                this.bgColorValue.textContent = value;
                break;
            case 'bgOpacity':
                this.bgOpacity.value = value * 100;
                this.bgOpacityValue.textContent = Math.round(value * 100) + '%';
                break;
            case 'textAlign':
                this.alignBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.align === value);
                });
                break;
        }
    }

    render() {
        if (!this.originalImage) return;

        const { captionText, fontSize, fontFamily, textColor, bgType, bgColor, bgOpacity, bgImage,
                captionWidth, bottomPadding, lineHeight, textAlign } = this.settings;

        const img = this.originalImage;
        const maxWidth = 1200;
        const scale = Math.min(1, maxWidth / img.width);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // 计算文字行数和所需高度
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = scaledWidth;
        tempCanvas.height = scaledHeight;
        tempCtx.font = `${fontSize}px "${fontFamily}"`;
        
        const maxCaptionWidth = tempCanvas.width * captionWidth;
        const lines = this.wrapText(captionText, maxCaptionWidth, tempCtx);
        const lineHeightPx = fontSize * lineHeight;
        
        // 计算额外高度：每行文字需要额外的空间
        const extraHeight = Math.max(0, lines.length - 1) * lineHeightPx;
        
        // 设置画布尺寸
        this.canvas.width = scaledWidth;
        this.canvas.height = scaledHeight + extraHeight;

        // 先绘制原图
        this.ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

        if (captionText.trim()) {
            this.drawCaptionWithCutting(lines, fontSize, fontFamily, textColor, bgType, bgColor,
                                      bgOpacity, bgImage, captionWidth, bottomPadding, lineHeight, textAlign, scaledHeight);
        }
    }

    drawCaptionWithCutting(lines, fontSize, fontFamily, textColor, bgType, bgColor, bgOpacity, bgImage,
                          captionWidth, bottomPadding, lineHeight, textAlign, originalImageHeight) {
        const { canvas, ctx } = this;

        ctx.font = `${fontSize}px "${fontFamily}"`;
        ctx.textBaseline = 'alphabetic'; // 改为alphabetic确保文字底部对齐

        const maxCaptionWidth = canvas.width * captionWidth;
        const lineHeightPx = fontSize * lineHeight;
        const captionX = (canvas.width - maxCaptionWidth) / 2;
        
        // 计算第一行文字的Y坐标，确保底部与原始图片底部对齐
        const firstLineY = originalImageHeight - lineHeightPx;
        
        // 根据背景类型选择不同的绘制方式
        if (bgType === 'image' && this.originalImage) {
            // 图片背景模式：使用第一行的纯背景数据
            const firstLinePureBackground = ctx.getImageData(0, firstLineY, canvas.width, lineHeightPx);
            
            lines.forEach((line, index) => {
                const lineY = firstLineY + index * lineHeightPx;
                
                // 所有行都使用第一行的纯背景（不包含文字）
                ctx.putImageData(firstLinePureBackground, 0, lineY);
                
                // 绘制文字
                this.drawTextLine(ctx, line, captionX, lineY, maxCaptionWidth, textAlign, textColor, lineHeightPx, fontSize);
            });
        } else {
            // 纯色背景模式：使用drawBackground函数绘制纯色背景
            lines.forEach((line, index) => {
                const lineY = firstLineY + index * lineHeightPx;
                
                // 绘制纯色背景
                this.drawBackground(ctx, 0, lineY, canvas.width, lineHeightPx, bgType, bgColor, bgOpacity, bgImage);
                
                // 绘制文字
                this.drawTextLine(ctx, line, captionX, lineY, maxCaptionWidth, textAlign, textColor, lineHeightPx, fontSize);
            });
        }
    }

    drawTextLine(ctx, line, captionX, lineY, maxCaptionWidth, textAlign, textColor, lineHeightPx, fontSize) {
        const textMetrics = ctx.measureText(line);
        const textWidth = textMetrics.width;
        
        let drawX;
        switch(textAlign) {
            case 'left':
                drawX = captionX;
                break;
            case 'center':
                drawX = captionX + (maxCaptionWidth - textWidth) / 2;
                break;
            case 'right':
                drawX = captionX + maxCaptionWidth - textWidth;
                break;
        }
        
        ctx.fillStyle = textColor;
        ctx.fillText(line, drawX, lineY + lineHeightPx - fontSize * 0.2); // 调整文字位置确保底部对齐
    }



    drawBackground(ctx, x, y, width, height, bgType, bgColor, bgOpacity, bgImage) {
        ctx.save();
        
        if (bgType === 'image' && this.originalImage) {
            // 使用主图片作为背景，实现等比例适配
            ctx.globalAlpha = bgOpacity;
            
            // 计算等比例缩放参数
            const imgAspect = this.originalImage.width / this.originalImage.height;
            const areaAspect = width / height;
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (imgAspect > areaAspect) {
                // 图片更宽，按高度适配
                drawHeight = height;
                drawWidth = drawHeight * imgAspect;
                drawX = x - (drawWidth - width) / 2;
                drawY = y;
            } else {
                // 图片更高，按宽度适配
                drawWidth = width;
                drawHeight = drawWidth / imgAspect;
                drawX = x;
                drawY = y - (drawHeight - height) / 2;
            }
            
            // 绘制等比例适配的背景图片
            ctx.drawImage(this.originalImage, drawX, drawY, drawWidth, drawHeight);
            ctx.globalAlpha = 1.0;
        } else {
            // 绘制纯色背景
            ctx.fillStyle = this.hexToRgba(bgColor, bgOpacity);
            ctx.fillRect(x, y, width, height);
        }
        
        ctx.restore();
    }

    wrapText(text, maxWidth, ctx) {
        // 先按换行符分割
        const paragraphs = text.split('\n');
        const lines = [];
        
        paragraphs.forEach(paragraph => {
            if (!paragraph.trim()) {
                lines.push('');
                return;
            }
            
            let currentLine = '';
            // 按字符分割，但考虑中文分词
            const chars = paragraph.split('');
            
            for (let i = 0; i < chars.length; i++) {
                const testLine = currentLine + chars[i];
                const metrics = ctx.measureText(testLine);

                if (metrics.width > maxWidth && currentLine.length > 0) {
                    lines.push(currentLine);
                    currentLine = chars[i];
                } else {
                    currentLine = testLine;
                }
            }
            
            if (currentLine) {
                lines.push(currentLine);
            }
        });

        return lines.length > 0 ? lines : [''];
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    downloadImage() {
        if (!this.originalImage) {
            alert('请先上传图片');
            return;
        }

        const { exportFormat, exportQuality } = this.settings;
        const link = document.createElement('a');

        const ext = exportFormat === 'jpeg' ? 'jpg' : 'png';
        const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png';

        link.download = `captioned_image.${ext}`;
        link.href = this.canvas.toDataURL(mimeType, exportQuality);
        link.click();
    }

    resetSettings() {
        try {
            // 重置设置对象
            this.settings = {
                captionText: '',
                fontSize: 32,
                fontFamily: 'Microsoft YaHei',
                textColor: '#ffffff',
                bgType: 'color',
                bgColor: '#000000',
                bgOpacity: 0.75,
                bgImage: null,
                captionWidth: 0.9,
                bottomPadding: 0,
                lineHeight: 1.4,
                textAlign: 'center',
                exportFormat: 'png',
                exportQuality: 0.9
            };

            // 重置UI元素
            this.captionText.value = '';
            this.fontSize.value = 32;
            this.fontSizeValue.textContent = '32px';
            this.fontFamily.value = 'Microsoft YaHei';
            this.textColor.value = '#ffffff';
            this.textColorValue.textContent = '#ffffff';
            this.bgType.value = 'color';
            this.bgColor.value = '#000000';
            this.bgColorValue.textContent = '#000000';
            this.bgOpacity.value = 75;
            this.bgOpacityValue.textContent = '75%';
            // 移除对不存在的bgImageInput和bgImageName的引用
            this.captionWidth.value = 90;
            this.captionWidthValue.textContent = '90%';
            this.bottomPadding.value = 0;
            this.bottomPaddingValue.textContent = '0px';
            this.lineHeight.value = 140;
            this.lineHeightValue.textContent = '140%';
            this.exportFormat.value = 'png';
            this.exportQuality.value = 90;
            this.exportQualityValue.textContent = '90%';
            
            // 重置对齐按钮
            this.alignBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.align === 'center');
            });

            // 重置模板按钮
            this.templateBtns.forEach(btn => {
                btn.classList.remove('active');
            });

            // 重置画布状态
            this.clearCanvas();

            // 重置上传的图像
            this.originalImage = null;
            this.imageInput.value = '';
            
            // 重置上传区域显示
            this.uploadArea.style.display = 'flex';
            this.canvasContainer.style.display = 'none';

            // 更新UI状态
            this.toggleBgImageGroup();
            this.qualityControl.style.display = 'none';

            console.log('重置功能执行成功，所有设置已恢复至初始状态');
        } catch (error) {
            console.error('重置功能执行失败:', error);
            // 提供用户友好的错误提示
            alert('重置过程中出现错误，请刷新页面后重试');
        }
    }

    clearCanvas() {
        try {
            // 清除画布内容
            if (!this.canvas || !this.ctx) {
                throw new Error('画布或上下文未初始化');
            }
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // 重置画布尺寸
            this.canvas.width = 1200;
            this.canvas.height = 800;
            // 设置默认背景色
            this.ctx.fillStyle = '#f0f0f0';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            // 添加提示文字
            this.ctx.fillStyle = '#999';
            this.ctx.font = '20px Microsoft YaHei';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('请上传图片开始编辑', this.canvas.width / 2, this.canvas.height / 2);
        } catch (error) {
            console.error('清除画布时出错:', error);
            // 尝试重新初始化画布
            this.initializeCanvas();
        }
    }

    initializeCanvas() {
        try {
            // 重新获取画布和上下文
            this.canvas = document.getElementById('mainCanvas');
            if (!this.canvas) {
                throw new Error('找不到画布元素');
            }
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('无法获取画布上下文');
            }
            
            // 设置默认尺寸和背景
            this.canvas.width = 1200;
            this.canvas.height = 800;
            this.ctx.fillStyle = '#f0f0f0';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#999';
            this.ctx.font = '20px Microsoft YaHei';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('请上传图片开始编辑', this.canvas.width / 2, this.canvas.height / 2);
        } catch (error) {
            console.error('初始化画布失败:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageCaptionGenerator();
});
