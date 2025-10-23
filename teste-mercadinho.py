#!/usr/bin/env python3
"""
Script simples para testar o Mercadinho do Cristhian e Isabele
"""
import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

def main():
    # Configurações
    PORT = 8000
    DIRECTORY = "public"
    
    print("🛒 Mercadinho do Cristhian e Isabele")
    print("=" * 50)
    
    # Verificar se está na pasta correta
    if not os.path.exists(DIRECTORY):
        print("❌ Erro: Pasta 'public' não encontrada!")
        print("💡 Execute este script na pasta raiz do projeto")
        return
    
    # Verificar arquivos essenciais
    essential_files = [
        "public/index.html",
        "public/styles.css", 
        "public/script.js",
        "public/multiplayer.js"
    ]
    
    missing_files = []
    for file in essential_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print("❌ Arquivos faltando:")
        for file in missing_files:
            print(f"   - {file}")
        return
    
    # Configurar servidor
    class CustomHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=DIRECTORY, **kwargs)
        
        def end_headers(self):
            self.send_header('Cache-Control', 'no-cache')
            super().end_headers()
    
    try:
        with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
            print(f"✅ Servidor iniciado com sucesso!")
            print(f"🌐 Acesse: http://localhost:{PORT}")
            print(f"📱 Para testar no celular/tablet, use o IP da máquina")
            print(f"🎮 Multiplayer disponível (conecte várias abas ou dispositivos)")
            print(f"🛑 Para parar: Ctrl+C")
            print("-" * 50)
            
            # Tentar abrir no navegador
            try:
                webbrowser.open(f"http://localhost:{PORT}")
                print("🔗 Navegador aberto automaticamente")
            except:
                print("⚠️  Abra manualmente o navegador")
            
            print("\n🎯 Como jogar:")
            print("1. Escolha a dificuldade")
            print("2. Arraste dinheiro para sua carteira")
            print("3. Arraste produtos para comprar")
            print("4. Clique em 'Jogar Juntos' para multiplayer")
            print("\n🚀 Divirta-se no mercadinho!")
            print("-" * 50)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n🛑 Servidor parado")
        print("👋 Obrigado por usar o Mercadinho do Cristhian e Isabele!")
    except OSError as e:
        if e.errno == 10048:
            print(f"❌ Porta {PORT} já está em uso!")
            print("💡 Feche outros servidores ou mude a porta")
        else:
            print(f"❌ Erro: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    main()