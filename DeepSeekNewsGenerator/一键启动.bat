@echo off
echo ===== DeepSeek新闻稿生成器 - 一键安装启动 =====
echo.

REM 设置编码为UTF-8
chcp 65001 > nul

REM 检查Python是否安装
echo 正在检查Python安装...
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到Python。请先安装Python 3.8或更高版本。
    echo 您可以从 https://www.python.org/downloads/ 下载Python。
    echo.
    echo 安装完成后，请重新运行此脚本。
    echo.
    pause
    exit /b 1
)

REM 显示Python版本
python --version
echo.

REM 检查pip是否可用
echo 正在检查pip...
python -m pip --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到pip。请确保Python安装正确。
    pause
    exit /b 1
)

REM 创建虚拟环境（如果不存在）
if not exist "venv" (
    echo 正在创建虚拟环境...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [错误] 创建虚拟环境失败。
        pause
        exit /b 1
    )
)

REM 激活虚拟环境
echo 正在激活虚拟环境...
call venv\Scripts\activate.bat

REM 安装依赖项
echo 正在安装依赖项...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [错误] 安装依赖项失败。
    pause
    exit /b 1
)

echo.
echo ===== 安装完成 =====
echo.

REM 启动应用程序
echo 正在启动DeepSeek新闻稿生成器...
echo.
echo 应用程序将在浏览器中打开。如果没有自动打开，请手动访问: http://127.0.0.1:5000
echo.
echo 要停止应用程序，请按Ctrl+C，然后在提示时输入Y确认。
echo.

REM 启动浏览器
start http://127.0.0.1:5000

REM 启动Flask应用
python app.py

REM 如果应用程序停止，等待用户按键
pause
