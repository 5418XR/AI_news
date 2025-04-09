#!/bin/bash

echo "===== DeepSeek新闻稿生成器 - 一键安装启动 ====="
echo ""

# 检查Python是否安装
echo "正在检查Python安装..."
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到Python。请先安装Python 3.8或更高版本。"
    echo "您可以使用系统包管理器安装Python，例如："
    echo "  - Ubuntu/Debian: sudo apt install python3 python3-pip python3-venv"
    echo "  - macOS (使用Homebrew): brew install python"
    echo ""
    echo "安装完成后，请重新运行此脚本。"
    echo ""
    read -p "按回车键退出..."
    exit 1
fi

# 显示Python版本
python3 --version
echo ""

# 检查pip是否可用
echo "正在检查pip..."
if ! command -v pip3 &> /dev/null; then
    echo "[错误] 未找到pip。请确保Python安装正确。"
    read -p "按回车键退出..."
    exit 1
fi

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "正在创建虚拟环境..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "[错误] 创建虚拟环境失败。"
        read -p "按回车键退出..."
        exit 1
    fi
fi

# 激活虚拟环境
echo "正在激活虚拟环境..."
source venv/bin/activate

# 安装依赖项
echo "正在安装依赖项..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "[错误] 安装依赖项失败。"
    read -p "按回车键退出..."
    exit 1
fi

echo ""
echo "===== 安装完成 ====="
echo ""

# 启动应用程序
echo "正在启动DeepSeek新闻稿生成器..."
echo ""
echo "应用程序将在浏览器中打开。如果没有自动打开，请手动访问: http://127.0.0.1:5000"
echo ""
echo "要停止应用程序，请按Ctrl+C。"
echo ""

# 启动浏览器（根据操作系统）
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open http://127.0.0.1:5000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open http://127.0.0.1:5000 &> /dev/null || echo "请手动打开浏览器访问: http://127.0.0.1:5000"
fi

# 启动Flask应用
python app.py

# 如果应用程序停止，等待用户按键
read -p "按回车键退出..."
