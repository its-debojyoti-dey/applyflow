import { getStorage, addBlockedCompany } from '../../shared/storage';
import { LINKEDIN_SELECTORS } from '../../shared/constants';

export async function processJobCardsForBlocklist(cards: HTMLElement[]): Promise<void> {
  const storage = await getStorage();
  const blockedMap = new Set(storage.blockedCompanies.map((c) => c.name.toLowerCase().trim()));

  cards.forEach((card) => {
    // Find company element with multiple fallback selectors
    let companyElem = card.querySelector<HTMLElement>(LINKEDIN_SELECTORS.companyName);
    
    // Fallback: look for company links if not found by selector
    if (!companyElem) {
      companyElem = card.querySelector<HTMLElement>('a[href*="/company/"]');
    }

    if (!companyElem) return; // Wait for element to render in DOM

    const rawCompany = companyElem.textContent?.trim() || '';
    if (!rawCompany) return;

    const normCompany = rawCompany.toLowerCase();

    // Insert Block Button into card if not already added
    if (!card.querySelector('.applyflow-block-btn')) {
      const blockBtn = document.createElement('button');
      blockBtn.className = 'applyflow-block-btn';
      blockBtn.setAttribute('type', 'button');
      blockBtn.setAttribute('title', `Block ${rawCompany}`);
      blockBtn.textContent = '🚫 Block';
      blockBtn.style.cssText = `
        margin-left: 6px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
        line-height: 1.2;
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #f87171;
        border-radius: 12px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        z-index: 10;
        position: relative;
      `;

      blockBtn.onclick = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        await addBlockedCompany(rawCompany);
        card.style.opacity = '0.2';
        card.style.filter = 'grayscale(100%)';
        card.style.display = storage.settings.autoHideBlocked ? 'none' : 'block';
      };

      // Find the parent container or insert right after companyElem
      const parent = companyElem.parentElement;
      if (parent && parent.tagName !== 'A') {
        parent.style.overflow = 'visible';
        parent.appendChild(blockBtn);
      } else {
        companyElem.insertAdjacentElement('afterend', blockBtn);
      }
    }

    // Apply hiding / muting if company is in blocklist
    if (blockedMap.has(normCompany)) {
      card.dataset.blocked = 'true';
      if (storage.settings.autoHideBlocked) {
        card.style.display = 'none';
      } else {
        card.style.opacity = '0.2';
        card.style.filter = 'grayscale(100%)';
      }
    }

    card.dataset.applyflowProcessed = 'true';
  });
}
