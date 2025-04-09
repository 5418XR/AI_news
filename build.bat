@echo off
echo ===== DeepSeek新闻稿生成器构建脚本 =====
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Python，请安装Python 3.8或更高版本。
    exit /b 1
)

REM 检查pip是否可用
python -m pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到pip，请确保pip已安装。
    exit /b 1
)

echo 正在安装依赖项...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo 错误: 安装依赖项失败。
    exit /b 1
)

echo.
echo 正在创建图标文件夹...
if not exist static mkdir static

echo.
echo 正在创建许可证文件...
python -c "with open('LICENSE.txt', 'w', encoding='utf-8') as f: f.write('DeepSeek新闻稿生成器许可协议\n\n版权所有 (c) 2025 DeepSeek\n\n...')"

echo.
echo 正在运行构建脚本...
python build.py
if %errorlevel% neq 0 (
    echo 错误: 构建失败。
    exit /b 1
)

echo.
echo 检查NSIS是否安装...
where makensis >nul 2>&1
if %errorlevel% neq 0 (
    echo 警告: 未找到NSIS，无法创建安装程序。
    echo 请安装NSIS后手动运行: makensis DeepSeekNewsGenerator.nsi
) else (
    echo 正在创建安装程序...
    makensis DeepSeekNewsGenerator.nsi
    if %errorlevel% neq 0 (
        echo 错误: 创建安装程序失败。
    ) else (
        echo 安装程序创建成功: DeepSeekNewsGenerator-Setup.exe
    )
)

echo.
echo ===== 构建过程完成 =====
echo.
echo 如果构建成功，您可以在dist目录中找到可执行文件。
echo 如果生成了安装程序，您可以在当前目录找到DeepSeekNewsGenerator-Setup.exe。
echo.
echo 按任意键退出...
pause >nul
