import os
import sys
import shutil
from flask_frozen import Freezer
from app import app

# 配置
BUILD_DIR = 'build'
DIST_DIR = 'dist'
APP_NAME = 'DeepSeekNewsGenerator'

def clean_build_dirs():
    """清理构建目录"""
    print("清理构建目录...")
    for directory in [BUILD_DIR, DIST_DIR]:
        if os.path.exists(directory):
            shutil.rmtree(directory)
        os.makedirs(directory)

def freeze_app():
    """冻结Flask应用为静态文件"""
    print("冻结Flask应用...")
    app.config['FREEZER_DESTINATION'] = BUILD_DIR
    app.config['FREEZER_RELATIVE_URLS'] = True
    freezer = Freezer(app)
    freezer.freeze()

def create_pyinstaller_spec():
    """创建PyInstaller规范文件"""
    print("创建PyInstaller规范文件...")
    spec_content = f"""# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('{BUILD_DIR}', 'static'),
        ('templates', 'templates'),
    ],
    hiddenimports=['flask', 'jinja2', 'werkzeug'],
    hookspath=[],
    hooksconfig={{}},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='{APP_NAME}',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='static/favicon.ico' if os.path.exists('static/favicon.ico') else None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='{APP_NAME}',
)
"""
    with open(f"{APP_NAME}.spec", "w", encoding="utf-8") as f:
        f.write(spec_content)

def build_executable():
    """使用PyInstaller构建可执行文件"""
    print("构建可执行文件...")
    os.system(f"pyinstaller {APP_NAME}.spec --distpath={DIST_DIR}")

def create_installer_script():
    """创建NSIS安装脚本"""
    print("创建安装脚本...")
    nsis_script = f"""
; DeepSeekNewsGenerator安装脚本
Unicode True

!define APP_NAME "{APP_NAME}"
!define APP_VERSION "1.0.0"
!define APP_PUBLISHER "DeepSeek"
!define APP_WEBSITE "https://www.deepseek.com"

Name "${{APP_NAME}}"
OutFile "${{APP_NAME}}-Setup.exe"
InstallDir "$PROGRAMFILES\\${{APP_NAME}}"
InstallDirRegKey HKLM "Software\\${{APP_NAME}}" "Install_Dir"

RequestExecutionLevel admin

!include "MUI2.nsh"

!define MUI_ABORTWARNING
!define MUI_ICON "${{NSISDIR}}\\Contrib\\Graphics\\Icons\\modern-install.ico"
!define MUI_UNICON "${{NSISDIR}}\\Contrib\\Graphics\\Icons\\modern-uninstall.ico"

!define MUI_WELCOMEPAGE_TITLE "欢迎安装${{APP_NAME}}"
!define MUI_WELCOMEPAGE_TEXT "这将安装${{APP_NAME}} ${{APP_VERSION}}到您的计算机。$\\r$\\n$\\r$\\n${{APP_NAME}}是一个基于DeepSeek API的新闻稿生成工具，可以帮助您快速生成高质量的新闻稿。$\\r$\\n$\\r$\\n点击"下一步"继续。"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

!define MUI_FINISHPAGE_RUN "$INSTDIR\\${{APP_NAME}}.exe"
!define MUI_FINISHPAGE_RUN_TEXT "运行${{APP_NAME}}"
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "SimpChinese"

Section "安装"
  SetOutPath "$INSTDIR"
  
  ; 复制文件
  File /r "{DIST_DIR}\\${{APP_NAME}}\\*.*"
  
  ; 创建卸载程序
  WriteUninstaller "$INSTDIR\\uninstall.exe"
  
  ; 创建开始菜单快捷方式
  CreateDirectory "$SMPROGRAMS\\${{APP_NAME}}"
  CreateShortcut "$SMPROGRAMS\\${{APP_NAME}}\\${{APP_NAME}}.lnk" "$INSTDIR\\${{APP_NAME}}.exe"
  CreateShortcut "$SMPROGRAMS\\${{APP_NAME}}\\卸载.lnk" "$INSTDIR\\uninstall.exe"
  
  ; 创建桌面快捷方式
  CreateShortcut "$DESKTOP\\${{APP_NAME}}.lnk" "$INSTDIR\\${{APP_NAME}}.exe"
  
  ; 写入注册表信息
  WriteRegStr HKLM "Software\\${{APP_NAME}}" "Install_Dir" "$INSTDIR"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}" "DisplayName" "${{APP_NAME}}"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}" "UninstallString" '"$INSTDIR\\uninstall.exe"'
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}" "DisplayIcon" "$INSTDIR\\${{APP_NAME}}.exe"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}" "Publisher" "${{APP_PUBLISHER}}"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}" "URLInfoAbout" "${{APP_WEBSITE}}"
  WriteRegDWORD HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}" "NoModify" 1
  WriteRegDWORD HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  ; 删除安装的文件
  RMDir /r "$INSTDIR"
  
  ; 删除开始菜单快捷方式
  RMDir /r "$SMPROGRAMS\\${{APP_NAME}}"
  
  ; 删除桌面快捷方式
  Delete "$DESKTOP\\${{APP_NAME}}.lnk"
  
  ; 删除注册表项
  DeleteRegKey HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}"
  DeleteRegKey HKLM "Software\\${{APP_NAME}}"
SectionEnd
"""
    with open(f"{APP_NAME}.nsi", "w", encoding="utf-8") as f:
        f.write(nsis_script)

def create_license_file():
    """创建许可证文件"""
    print("创建许可证文件...")
    license_content = """DeepSeek新闻稿生成器许可协议

版权所有 (c) 2025 DeepSeek

1. 授权
   本软件授权您非排他性、不可转让的权利，仅用于个人或内部业务目的使用本软件。

2. 限制
   您不得：
   - 复制、修改、改编、翻译或创建本软件的衍生作品
   - 反编译、反汇编、逆向工程或以其他方式尝试获取本软件的源代码
   - 出租、租赁、出借、再许可、分发或转让本软件
   - 移除或更改本软件上的任何所有权声明

3. API密钥使用
   本软件需要DeepSeek API密钥才能正常运行。您负责获取自己的API密钥，并对使用该密钥产生的所有费用负责。

4. 免责声明
   本软件按"原样"提供，不提供任何明示或暗示的保证，包括但不限于对适销性、特定用途适用性和非侵权性的保证。

5. 责任限制
   在任何情况下，软件作者或版权持有人均不对因使用本软件而产生的任何索赔、损害或其他责任负责，无论是在合同、侵权或其他方面。

6. 终止
   如果您违反本协议的任何条款，您使用本软件的权利将自动终止，无需通知。

通过安装和使用本软件，您表示您已阅读、理解并同意受本协议条款的约束。
"""
    with open("LICENSE.txt", "w", encoding="utf-8") as f:
        f.write(license_content)

def main():
    """主函数"""
    print(f"开始构建 {APP_NAME}...")
    
    # 检查是否存在favicon.ico
    if not os.path.exists('static/favicon.ico'):
        print("警告: 未找到favicon.ico文件，将使用默认图标")
    
    # 执行构建步骤
    clean_build_dirs()
    freeze_app()
    create_pyinstaller_spec()
    build_executable()
    create_installer_script()
    create_license_file()
    
    print(f"{APP_NAME} 构建完成！")
    print(f"可执行文件位于: {DIST_DIR}/{APP_NAME}/")
    print("要创建安装程序，请安装NSIS并运行:")
    print(f"makensis {APP_NAME}.nsi")

if __name__ == "__main__":
    main()
