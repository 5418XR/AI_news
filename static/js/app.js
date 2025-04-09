// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const toggleApiKeyBtn = document.getElementById('toggleApiKey');
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    const newsForm = document.getElementById('newsForm');
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultContainer = document.getElementById('resultContainer');
    const copyBtn = document.getElementById('copyBtn');
    const saveBtn = document.getElementById('saveBtn');
    const downloadDocxBtn = document.getElementById('downloadDocxBtn');
    const docxUpload = document.getElementById('docxUpload');
    const uploadDocxBtn = document.getElementById('uploadDocxBtn');
    const uploadStatus = document.getElementById('uploadStatus');
    const referenceContent = document.getElementById('referenceContent');
    const referencePreview = document.getElementById('referencePreview');
    const clearReferenceBtn = document.getElementById('clearReferenceBtn');
    
    // 存储上传的文档内容
    let uploadedContent = '';

    // 检查是否已保存API密钥
    checkApiKeyStatus();

    // 保存API密钥
    saveApiKeyBtn.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showApiKeyStatus('请输入API密钥', 'danger');
            return;
        }

        // 发送API密钥到服务器
        fetch('/save_api_key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ api_key: apiKey }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showApiKeyStatus('API密钥已保存', 'success');
                localStorage.setItem('apiKeySet', 'true');
            } else {
                showApiKeyStatus(data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showApiKeyStatus('保存API密钥时出错', 'danger');
        });
    });

    // 切换API密钥可见性
    toggleApiKeyBtn.addEventListener('click', function() {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleApiKeyBtn.innerHTML = '<i class="bi bi-eye-slash"></i>';
        } else {
            apiKeyInput.type = 'password';
            toggleApiKeyBtn.innerHTML = '<i class="bi bi-eye"></i>';
        }
    });

    // 上传Word文档
    uploadDocxBtn.addEventListener('click', function() {
        if (!docxUpload.files.length) {
            uploadStatus.innerHTML = '<span class="text-danger">请先选择文件</span>';
            return;
        }
        
        const file = docxUpload.files[0];
        if (!file.name.endsWith('.docx')) {
            uploadStatus.innerHTML = '<span class="text-danger">请上传.docx格式的文件</span>';
            return;
        }
        
        // 创建FormData对象
        const formData = new FormData();
        formData.append('docxFile', file);
        
        // 显示上传中状态
        uploadStatus.innerHTML = '<span class="text-info">正在上传...</span>';
        
        // 发送请求到服务器
        fetch('/upload_docx', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                uploadStatus.innerHTML = '<span class="text-success">上传成功</span>';
                uploadedContent = data.content;
                
                // 显示预览
                const previewText = uploadedContent.length > 200 
                    ? uploadedContent.substring(0, 200) + '...' 
                    : uploadedContent;
                referencePreview.textContent = previewText;
                referenceContent.classList.remove('d-none');
            } else {
                uploadStatus.innerHTML = `<span class="text-danger">${data.message}</span>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            uploadStatus.innerHTML = '<span class="text-danger">上传失败，请重试</span>';
        });
    });
    
    // 清除参考内容
    clearReferenceBtn.addEventListener('click', function() {
        uploadedContent = '';
        referenceContent.classList.add('d-none');
        referencePreview.textContent = '';
        docxUpload.value = '';
        uploadStatus.innerHTML = '';
    });
    
    // 提交表单生成新闻稿
    newsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 检查是否设置了API密钥
        if (!localStorage.getItem('apiKeySet')) {
            showApiKeyStatus('请先设置API密钥', 'danger');
            apiKeyInput.focus();
            return;
        }
        
        // 获取表单数据
        const newsType = document.getElementById('newsType').value;
        const topic = document.getElementById('topic').value.trim();
        const keywords = document.getElementById('keywords').value.trim();
        const length = document.getElementById('length').value;
        const tone = document.getElementById('tone').value;
        
        // 验证主题
        if (!topic) {
            alert('请输入新闻主题');
            return;
        }
        
        // 显示加载指示器
        loadingIndicator.classList.remove('d-none');
        resultContainer.innerHTML = '';
        generateBtn.disabled = true;
        copyBtn.disabled = true;
        saveBtn.disabled = true;
        downloadDocxBtn.disabled = true;
        
        // 发送请求到服务器
        fetch('/generate_news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                news_type: newsType,
                topic: topic,
                keywords: keywords,
                length: length,
                tone: tone,
                reference_content: uploadedContent
            }),
        })
        .then(response => response.json())
        .then(data => {
            // 隐藏加载指示器
            loadingIndicator.classList.add('d-none');
            generateBtn.disabled = false;
            
            if (data.status === 'success') {
                // 显示生成的新闻稿
                resultContainer.innerHTML = formatNewsContent(data.news_content);
                copyBtn.disabled = false;
                saveBtn.disabled = false;
                downloadDocxBtn.disabled = false;
            } else {
                // 显示错误信息
                resultContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingIndicator.classList.add('d-none');
            generateBtn.disabled = false;
            resultContainer.innerHTML = '<div class="alert alert-danger">生成新闻稿时出错，请重试</div>';
        });
    });

    // 复制生成的新闻稿
    copyBtn.addEventListener('click', function() {
        const content = resultContainer.innerText;
        navigator.clipboard.writeText(content)
            .then(() => {
                showToast('已复制到剪贴板');
            })
            .catch(err => {
                console.error('复制失败:', err);
                showToast('复制失败，请手动复制', 'danger');
            });
    });

    // 保存生成的新闻稿
    saveBtn.addEventListener('click', function() {
        const content = resultContainer.innerText;
        const topic = document.getElementById('topic').value.trim();
        const fileName = `新闻稿_${topic}_${formatDate(new Date())}.txt`;
        
        // 创建Blob对象
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // 创建下载链接
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    });
    
    // 下载Word文档
    downloadDocxBtn.addEventListener('click', function() {
        const content = resultContainer.innerText;
        const topic = document.getElementById('topic').value.trim();
        
        // 显示加载状态
        downloadDocxBtn.disabled = true;
        downloadDocxBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> 处理中...';
        
        // 发送请求到服务器
        fetch('/download_docx', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: content,
                title: topic || '新闻稿'
            }),
        })
        .then(response => {
            if (response.ok) {
                return response.blob();
            } else {
                throw new Error('下载失败');
            }
        })
        .then(blob => {
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `新闻稿_${topic}_${formatDate(new Date())}.docx`;
            document.body.appendChild(a);
            a.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            // 恢复按钮状态
            downloadDocxBtn.disabled = false;
            downloadDocxBtn.innerHTML = '<i class="bi bi-file-earmark-word"></i> 下载Word';
            
            showToast('Word文档已下载');
        })
        .catch(error => {
            console.error('Error:', error);
            downloadDocxBtn.disabled = false;
            downloadDocxBtn.innerHTML = '<i class="bi bi-file-earmark-word"></i> 下载Word';
            showToast('下载Word文档失败，请重试', 'danger');
        });
    });

    // 辅助函数：检查API密钥状态
    function checkApiKeyStatus() {
        if (localStorage.getItem('apiKeySet')) {
            showApiKeyStatus('API密钥已设置', 'success');
        }
    }

    // 辅助函数：显示API密钥状态
    function showApiKeyStatus(message, type) {
        apiKeyStatus.innerHTML = `<div class="text-${type}">${message}</div>`;
    }

    // 辅助函数：格式化新闻内容
    function formatNewsContent(content) {
        // 将换行符转换为HTML换行
        let formattedContent = content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
        
        // 确保内容被包裹在段落标签中
        if (!formattedContent.startsWith('<p>')) {
            formattedContent = '<p>' + formattedContent;
        }
        if (!formattedContent.endsWith('</p>')) {
            formattedContent = formattedContent + '</p>';
        }
        
        return formattedContent;
    }

    // 辅助函数：显示提示消息
    function showToast(message, type = 'success') {
        // 创建toast元素
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-white bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        document.body.appendChild(toastEl);
        
        // 初始化toast
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
        
        // 监听隐藏事件，移除元素
        toastEl.addEventListener('hidden.bs.toast', function() {
            document.body.removeChild(toastEl);
        });
    }

    // 辅助函数：格式化日期
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}${month}${day}_${hours}${minutes}`;
    }
});
