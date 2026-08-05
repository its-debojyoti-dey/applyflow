import { LINKEDIN_SELECTORS } from '../../shared/constants';
import { getStorage } from '../../shared/storage';

export async function injectRecruiterOutreachBanner(): Promise<void> {
  const recruiterElem = document.querySelector(LINKEDIN_SELECTORS.recruiterCard);
  if (!recruiterElem || recruiterElem.querySelector('.applyflow-recruiter-banner')) return;

  const nameElem = recruiterElem.querySelector(LINKEDIN_SELECTORS.recruiterName);
  const recruiterName = nameElem?.textContent?.trim() || 'Recruiter';

  const jobTitleElem = document.querySelector('.jobs-unified-top-card__job-title, .job-details-jobs-unified-top-card__job-title');
  const jobTitle = jobTitleElem?.textContent?.trim() || 'this role';

  const companyElem = document.querySelector('.jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company-name');
  const companyName = companyElem?.textContent?.trim() || 'your company';

  const banner = document.createElement('div');
  banner.className = 'applyflow-recruiter-banner';
  banner.style.cssText = 'margin: 12px 0; padding: 10px 14px; background: #e0f2fe; border: 1px solid #38bdf8; border-radius: 8px; font-size: 13px; color: #0369a1; display: flex; align-items: center; justify-content: space-between; z-index: 10; position: relative;';

  const titleText = document.createElement('span');
  titleText.textContent = `👤 `;
  
  const strongName = document.createElement('strong');
  strongName.textContent = recruiterName;
  titleText.appendChild(strongName);
  
  const textSuffix = document.createTextNode(' is hiring for this role');
  titleText.appendChild(textSuffix);

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.textContent = '📩 Copy Cold Outreach';
  copyBtn.style.cssText = 'padding: 4px 10px; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px;';
  
  copyBtn.onclick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const store = await getStorage();
    const template = store.templates[0]?.content || 'Hi {recruiter_name}, I noticed you are hiring for {job_title} at {company_name}.';
    const message = template
      .replace('{recruiter_name}', recruiterName)
      .replace('{job_title}', jobTitle)
      .replace('{company_name}', companyName);
    
    await navigator.clipboard.writeText(message);
    copyBtn.textContent = '✅ Copied to Clipboard!';
    setTimeout(() => { copyBtn.textContent = '📩 Copy Cold Outreach'; }, 2000);
  };

  banner.appendChild(titleText);
  banner.appendChild(copyBtn);
  recruiterElem.prepend(banner);
}
