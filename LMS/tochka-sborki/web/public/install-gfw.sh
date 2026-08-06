#!/usr/bin/env bash
set -euo pipefail

# Точка Сборки — установщик GFW/restricted-geo стека (Mac/Linux)
# Ставит: Python + LiteLLM proxy + Aider; пишет cloud-relay конфиг (Cerebras + Gemini Flash).
# Использование: curl -fsSL https://ai.mamaev.coach/install-gfw.sh | bash

GUIDE_URL="https://ai.mamaev.coach/lessons/03-stack-selection"
CFG_DIR="$HOME/.config/litellm"

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
    info "Homebrew не найден — устанавливаю…"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    if   [ -x /opt/homebrew/bin/brew ]; then eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [ -x /usr/local/bin/brew ];    then eval "$(/usr/local/bin/brew shellenv)"; fi
  fi
}

ensure_python() {
  if [ "$OS" = "Darwin" ]; then
    ensure_brew
    brew install python pipx
  else
    case "$PM" in
      apt)    warn "нужен sudo"; sudo apt-get update -y && sudo apt-get install -y python3 python3-pip pipx ;;
      dnf)    warn "нужен sudo"; sudo dnf install -y python3 python3-pip pipx ;;
      pacman) warn "нужен sudo"; sudo pacman -Sy --noconfirm python python-pipx ;;
      *) err "Не нашёл apt/dnf/pacman. Поставь Python 3 + pipx вручную: $GUIDE_URL"; exit 1 ;;
    esac
  fi
  pipx ensurepath >/dev/null 2>&1 || true
  export PATH="$HOME/.local/bin:$PATH"
  ok "Python готов ($(python3 --version 2>/dev/null || python --version))"
}

install_tools() {
  info "Ставлю LiteLLM proxy и Aider (через pipx)…"
  pipx install 'litellm[proxy]' || pipx upgrade 'litellm[proxy]' || true
  pipx install aider-chat || pipx upgrade aider-chat || true
  ok "LiteLLM + Aider готовы"
}

write_config() {
  mkdir -p "$CFG_DIR"
  local cfg="$CFG_DIR/config.yaml"
  if [ -f "$cfg" ]; then
    cp "$cfg" "$cfg.bak"
    warn "config.yaml уже есть — бэкап в config.yaml.bak, не затираю"
  else
    cat > "$cfg" <<'YAML'
model_list:
  - model_name: fast-pool
    litellm_params:
      model: cerebras/qwen-3-235b-a22b
      api_key: os.environ/CEREBRAS_API_KEY
  - model_name: balanced
    litellm_params:
      model: gemini/gemini-2.5-flash
      api_key: os.environ/GOOGLE_API_KEY
  # local-floor (llama-server :8080) — опционально, см. гайд u3 «Шаг 4»
router_settings:
  routing_strategy: simple-shuffle
  fallbacks:
    - fast-pool: ["balanced"]
YAML
    ok "config.yaml записан"
  fi
  cat > "$CFG_DIR/.env.example" <<'ENVX'
# Скопируй этот файл в .env и впиши свои ключи
CEREBRAS_API_KEY=csk-xxxxx
GOOGLE_API_KEY=AIza-xxxxx
ENVX
  cat > "$CFG_DIR/start.sh" <<'START'
#!/usr/bin/env bash
set -euo pipefail
CFG_DIR="$HOME/.config/litellm"
if [ -f "$CFG_DIR/.env" ]; then set -a; . "$CFG_DIR/.env"; set +a
else echo "Нет $CFG_DIR/.env — скопируй .env.example в .env и впиши ключи"; exit 1; fi
exec litellm --config "$CFG_DIR/config.yaml" --port 4000
START
  chmod +x "$CFG_DIR/start.sh"
  ok "launcher start.sh + .env.example готовы"
}

doctor() {
  printf "\n${C_BLUE}— Проверка —${C_RESET}\n"
  if have python3; then ok "python $(python3 --version 2>/dev/null | awk '{print $2}')"; else warn "python не найден"; fi
  if have litellm; then ok "litellm установлен"; else warn "litellm не на PATH (открой новый терминал)"; fi
  if have aider;   then ok "aider установлен";   else warn "aider не на PATH (открой новый терминал)"; fi
  printf "\n${C_GREEN}Готово!${C_RESET} Следующие шаги:\n"
  printf "  1. cp %s/.env.example %s/.env  — и впиши ключи Cerebras + Gemini\n" "$CFG_DIR" "$CFG_DIR"
  printf "  2. Запусти прокси:  %s/start.sh\n" "$CFG_DIR"
  printf "  3. Наведи Aider:    aider --model openai/fast-pool --openai-api-base http://localhost:4000\n"
  printf "     (Aider попросит OPENAI_API_KEY — впиши любое значение, напр. 'sk-local')\n"
  printf "  GUI-вариант: расширение Cline в VS Code → тот же http://localhost:4000\n"
  printf "\nПодробный гайд: %s\n" "$GUIDE_URL"
}

main() {
  printf "${C_BLUE}Точка Сборки — установка GFW/restricted-geo стека${C_RESET}\n\n"
  detect_pm
  if [ "$OS" = "Linux" ] && [ -z "$PM" ]; then
    err "Не нашёл apt/dnf/pacman. Поставь Python 3 + pipx вручную: $GUIDE_URL"; exit 1
  fi
  ensure_python
  install_tools
  write_config
  doctor
}
main "$@"
