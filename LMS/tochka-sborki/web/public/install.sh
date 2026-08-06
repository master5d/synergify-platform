#!/usr/bin/env bash
set -euo pipefail

# Точка Сборки — установщик базового agentic stack (Mac/Linux)
# Ставит: Node.js LTS + Git + Claude Code. Идемпотентно.
# Использование: curl -fsSL https://ai.mamaev.coach/install.sh | bash

GUIDE_URL="https://ai.mamaev.coach/lessons/02-setup-guide"
NODE_MIN_MAJOR=18

if [ -t 1 ]; then
  C_RESET='\033[0m'; C_BLUE='\033[1;34m'; C_GREEN='\033[1;32m'; C_YELLOW='\033[1;33m'; C_RED='\033[1;31m'
else
  C_RESET=''; C_BLUE=''; C_GREEN=''; C_YELLOW=''; C_RED=''
fi
info() { printf "${C_BLUE}▸ %s${C_RESET}\n" "$1"; }
ok()   { printf "${C_GREEN}✓ %s${C_RESET}\n" "$1"; }
warn() { printf "${C_YELLOW}! %s${C_RESET}\n" "$1"; }
err()  { printf "${C_RED}✗ %s${C_RESET}\n" "$1" >&2; }
have() { command -v "$1" >/dev/null 2>&1; }
node_major() { node -v 2>/dev/null | sed 's/^v//' | cut -d. -f1; }

OS="$(uname -s)"
PM=""
detect_pm() {
  case "$OS" in
    Darwin) PM="brew" ;;
    Linux)
      if   have apt-get; then PM="apt"
      elif have dnf;     then PM="dnf"
      elif have pacman;  then PM="pacman"
      else PM=""; fi ;;
    *) PM="" ;;
  esac
}

ensure_brew() {
  if ! have brew; then
    info "Homebrew не найден — устанавливаю (нужен для node/git на Mac)…"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    if   [ -x /opt/homebrew/bin/brew ]; then eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [ -x /usr/local/bin/brew ];    then eval "$(/usr/local/bin/brew shellenv)"; fi
  fi
  ok "Homebrew готов"
}

pm_install() {
  case "$PM" in
    brew)   brew install "$@" ;;
    apt)    warn "Установка через apt требует sudo"; sudo apt-get update -y && sudo apt-get install -y "$@" ;;
    dnf)    warn "Установка через dnf требует sudo"; sudo dnf install -y "$@" ;;
    pacman) warn "Установка через pacman требует sudo"; sudo pacman -Sy --noconfirm "$@" ;;
    *) err "Неизвестный пакетный менеджер. Установи Node.js LTS и Git вручную: $GUIDE_URL"; exit 1 ;;
  esac
}

ensure_node() {
  if have node && [ "$(node_major)" -ge "$NODE_MIN_MAJOR" ] 2>/dev/null; then
    ok "Node.js уже установлен ($(node -v))"; return
  fi
  info "Устанавливаю Node.js LTS…"
  case "$PM" in
    brew)               pm_install node ;;
    apt|dnf|pacman)     pm_install nodejs npm ;;
  esac
  if have node; then ok "Node.js установлен ($(node -v))"; else err "Не удалось установить Node.js. Ручной гайд: $GUIDE_URL"; exit 1; fi
}

ensure_git() {
  if have git; then ok "Git уже установлен ($(git --version))"; return; fi
  info "Устанавливаю Git…"
  pm_install git
  if have git; then ok "Git установлен"; else err "Не удалось установить Git. Ручной гайд: $GUIDE_URL"; exit 1; fi
}

ensure_claude() {
  if have claude; then ok "Claude Code уже установлен"; return; fi
  info "Устанавливаю Claude Code (глобально, без sudo)…"
  local PREFIX="$HOME/.npm-global"
  npm config set prefix "$PREFIX"
  export PATH="$PREFIX/bin:$PATH"
  local LINE="export PATH=\"$PREFIX/bin:\$PATH\""
  for RC in "$HOME/.profile" "$HOME/.zshrc" "$HOME/.bashrc"; do
    [ -f "$RC" ] || continue
    grep -qF ".npm-global/bin" "$RC" || printf '\n# Точка Сборки — Claude Code\n%s\n' "$LINE" >> "$RC"
  done
  npm install -g @anthropic-ai/claude-code
  if have claude; then ok "Claude Code установлен"; else warn "Claude Code установлен, но не на PATH — открой новый терминал"; fi
}

doctor() {
  printf "\n${C_BLUE}— Проверка —${C_RESET}\n"
  if have node;   then ok "node  $(node -v)";                                  else warn "node не найден"; fi
  if have git;    then ok "git   $(git --version | awk '{print $3}')";         else warn "git не найден"; fi
  if have claude; then ok "claude установлен";                                 else warn "claude не на PATH (открой новый терминал)"; fi
  printf "\n${C_GREEN}Готово!${C_RESET} Следующие шаги:\n"
  printf "  1. Открой НОВЫЙ терминал (чтобы подхватился PATH)\n"
  printf "  2. Запусти:  claude\n"
  printf "  3. Залогинься по ссылке, которую он покажет\n"
  printf "\nПодробный гайд: %s\n" "$GUIDE_URL"
}

main() {
  printf "${C_BLUE}Точка Сборки — установка agentic stack${C_RESET}\n\n"
  detect_pm
  [ "$OS" = "Darwin" ] && ensure_brew
  if [ "$OS" = "Linux" ] && [ -z "$PM" ]; then
    err "Не нашёл apt/dnf/pacman. Установи Node.js LTS и Git вручную: $GUIDE_URL"; exit 1
  fi
  ensure_node
  ensure_git
  ensure_claude
  doctor
}
main "$@"
