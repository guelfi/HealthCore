# Install Warp Terminal on WSL (Ubuntu)

Este guia descreve passo a passo como instalar e configurar o Warp Terminal no **WSL2** (Ubuntu), incluindo requisitos, instalação, configuração de GUI (WSLg/X11) e solução de problemas.

## 📋 Pré-requisitos
- Windows 10/11 com **WSL2** habilitado
- Distribuição **Ubuntu** instalada (recomendado)
- Preferencial: **Windows 11** com **WSLg** (suporte a GUI nativo)

Verifique sua versão do WSL:
```bash
wsl --status
```

---

## 🚀 Método 1 — Instalação Direta (.deb)

1) Abra o Ubuntu (WSL)
```bash
wsl -d Ubuntu
```

2) Atualize o sistema
```bash
sudo apt update && sudo apt upgrade -y
```

3) Instale dependências
```bash
sudo apt install -y wget curl gnupg lsb-release
```

4) Baixe e instale o pacote do Warp
```bash
wget -O warp-terminal.deb "https://releases.warp.dev/linux/v0.2024.10.29.08.02.stable/warp-terminal_0.2024.10.29.08.02.stable_amd64.deb"
sudo dpkg -i warp-terminal.deb || sudo apt -f install -y
```

5) Execute o Warp
```bash
warp-terminal &
```

---

## 📦 Método 2 — Via Repositório Oficial (APT)

1) Adicione a chave GPG
```bash
curl -fsSL https://releases.warp.dev/linux/keys/warp.asc | sudo gpg --dearmor -o /usr/share/keyrings/warp.gpg
```

2) Adicione o repositório
```bash
echo "deb [signed-by=/usr/share/keyrings/warp.gpg] https://releases.warp.dev/linux/deb stable main" | sudo tee /etc/apt/sources.list.d/warp.list
```

3) Atualize e instale
```bash
sudo apt update
sudo apt install -y warp-terminal
```

4) Execute
```bash
warp-terminal &
```

---

## 🧰 Método 3 — AppImage (Portável)

1) Baixe a AppImage
```bash
cd ~/Downloads
wget https://releases.warp.dev/linux/v0.2024.10.29.08.02.stable/warp-terminal-v0.2024.10.29.08.02.stable-x86_64.AppImage
```

2) Dê permissão de execução
```bash
chmod +x warp-terminal-*.AppImage
```

3) Execute
```bash
./warp-terminal-*.AppImage &
```

---

## 🖥️ Habilitando a Interface Gráfica (GUI)

### Opção A: WSLg (Windows 11)
- Normalmente funciona automaticamente.
- Teste rápido:
```bash
echo $DISPLAY  # Deve exibir :0 ou semelhante
sudo apt install -y x11-apps
xcalc  # Deve abrir a calculadora
```

### Opção B: X11 (VcXsrv) — se WSLg não estiver disponível
1) No Windows, instale o **VcXsrv** (https://sourceforge.net/projects/vcxsrv/)
2) Inicie com:
   - Multiple windows
   - Display number: 0
   - Disable access control: marcado
3) No WSL, configure o DISPLAY (adicione ao ~/.bashrc):
```bash
echo 'export DISPLAY=$(grep -m 1 nameserver /etc/resolv.conf | awk "{print $2}"):0' >> ~/.bashrc
source ~/.bashrc
```

---

## ⚙️ Integração com Windows Terminal (Opcional)

No Windows Terminal, adicione/edite o perfil do WSL Ubuntu e personalize fonte/tema:
```json
{
  "profiles": {
    "list": [
      {
        "guid": "{YOUR-GUID}",
        "name": "Ubuntu (WSL)",
        "source": "Windows.Terminal.Wsl",
        "startingDirectory": "//wsl$/Ubuntu/home/SEU_USUARIO",
        "fontFace": "FiraCode Nerd Font",
        "fontSize": 12
      }
    ]
  }
}
```

---

## 🔧 Script Automático de Instalação

Crie um arquivo `install-warp.sh` no WSL:
```bash
cat > ~/install-warp.sh << 'EOF'
#!/usr/bin/env bash
set -e

echo "🚀 Instalando Warp Terminal no WSL..."
sudo apt update && sudo apt install -y wget curl gnupg lsb-release

wget -O warp-terminal.deb "https://releases.warp.dev/linux/v0.2024.10.29.08.02.stable/warp-terminal_0.2024.10.29.08.02.stable_amd64.deb"
sudo dpkg -i warp-terminal.deb || sudo apt -f install -y
rm -f warp-terminal.deb

mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/warp-terminal.desktop << DESK
[Desktop Entry]
Name=Warp Terminal
Exec=warp-terminal
Icon=warp-terminal
Type=Application
Categories=System;TerminalEmulator;
DESK

echo "✅ Instalação concluída. Rode: warp-terminal"
EOF

chmod +x ~/install-warp.sh
bash ~/install-warp.sh
```

---

## 🩺 Troubleshooting (Resolução de Problemas)

- "Display not found" ou GUI não abre:
```bash
echo $DISPLAY  # se vazio
export DISPLAY=:0  # temporário
# Para WSL2 + VcXsrv:
export DISPLAY=$(grep -m 1 nameserver /etc/resolv.conf | awk '{print $2}'):0
```

- Permissões X11:
```bash
xhost +local:root
```

- Fonts quebradas:
```bash
sudo apt install -y fonts-firacode fonts-powerline
fc-cache -fv
```

- Remover o Warp:
```bash
sudo apt remove -y warp-terminal && sudo apt autoremove -y
```

---

## ✅ Conclusão

Seguindo um dos métodos acima você terá o **Warp Terminal** rodando no **WSL2** com suporte a **GUI**. 
Se algo não funcionar, copie o erro e me envie que eu te ajudo a corrigir rapidamente. 👍

