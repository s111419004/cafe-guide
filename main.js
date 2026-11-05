let favorites = JSON.parse(localStorage.getItem('cafe_notes_favs') || '[]');
let allCafes = [];

document.addEventListener('DOMContentLoaded', () => {
  if (typeof getParsedCafes === 'function') {
    allCafes = getParsedCafes();
  }
  updateFavoriteBadge();
});

function toggleFavorite(e, cafeId) {
  e?.stopPropagation();
  const idx = favorites.indexOf(cafeId);
  if (idx > -1) {
    favorites.splice(idx, 1);
    showToast('已自口袋名單移除');
  } else {
    favorites.push(cafeId);
    showToast('已加入口袋名單');
  }
  localStorage.setItem('cafe_notes_favs', JSON.stringify(favorites));
  updateFavoriteBadge();

  if (typeof renderCafeList === 'function' && typeof applyFilters === 'function') {
    applyFilters();
  }
}

function updateFavoriteBadge() {
  const badge = document.getElementById('favBadge');
  const drawerCount = document.getElementById('drawerFavCount');

  if (badge) {
    if (favorites.length > 0) {
      badge.textContent = favorites.length;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  if (drawerCount) {
    drawerCount.textContent = favorites.length;
  }
  renderFavDrawerList();
}

function toggleFavDrawer(show) {
  const drawer = document.getElementById('favDrawer');
  if (!drawer) return;
  drawer.classList.toggle('hidden', !show);
  document.body.style.overflow = show ? 'hidden' : '';
}

function renderFavDrawerList() {
  const container = document.getElementById('favDrawerList');
  if (!container) return;

  const favCafes = allCafes.filter(c => favorites.includes(c.id));
  if (favCafes.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-caramel">
        <i class="fa-regular fa-bookmark text-2xl mb-2 opacity-50 block"></i>
        <p class="text-[13px]">口袋空空如也，快點擊咖啡卡片書籤進行收藏！</p>
      </div>
    `;
    return;
  }

  container.innerHTML = favCafes.map(cafe => `
    <div class="py-3 flex items-center justify-between gap-3">
      <div class="cursor-pointer flex-1" onclick="if(typeof openDetailModal === 'function'){ openDetailModal('${cafe.id}'); toggleFavDrawer(false); }">
        <h4 class="font-bold text-[15px] text-espresso hover:text-terracotta leading-snug">${cafe.mainTitle}</h4>
        <div class="text-[13px] text-caramel flex items-center gap-2 mt-0.5">
          <span>${cafe.region}</span>
          <span>•</span>
          <span>${cafe.hours}</span>
        </div>
      </div>
      <button onclick="toggleFavorite(event, '${cafe.id}')" class="text-caramel hover:text-red-600 p-1.5" title="移除">
        <i class="fa-solid fa-trash-can text-sm"></i>
      </button>
    </div>
  `).join('');
}

function copyAllFavNames() {
  const favCafes = allCafes.filter(c => favorites.includes(c.id));
  if (favCafes.length === 0) {
    showToast('口袋名單目前沒有店家');
    return;
  }
  const text = favCafes.map((c, i) => `${i + 1}. ${c.fullName} (${c.region})`).join('\n');
  copyToClipboard(text);
  showToast('已複製收藏清單文字');
}

function copyToClipboard(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch (err) {}
  document.body.removeChild(ta);
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.remove('translate-y-16', 'opacity-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('translate-y-16', 'opacity-0');
  }, 2200);
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (typeof closeDetailModal === 'function') closeDetailModal();
    toggleFavDrawer(false);
  }
});
