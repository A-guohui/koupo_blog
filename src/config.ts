import type { PostHideElements } from '~/content/config';

export const Site = 'https://koupo-blog.vercel.app/';
export const SiteLanguage = 'zh';
export const SiteTitle = '青萍之末';
export const SiteDescription = '风起于青萍之末';
export const FooterDescription = '屈身守分,以待天时';
export const AdminName = 'koupo';
export const PageSize = 15;

// socialPlatform => userName
// check components/Header.astro socialConfig for more info
export const Socials: Record<string, Record<string, string>> = {
	mail: { url: 'nwuagh@163.com' },
	// github: { url: 'https://github.com/ladit/astro-blog-zozo' },
	// x: { url: 'https://x.com/userName' },
	// mastodon: { url: 'https://mastodon.social/@userName' },
	// facebook: { url: 'https://facebook.com/userName' },
	// instagram: { url: 'https://instagram.com/userName' },
	// telegram: { url: 'https://t.me/@userName' },
	// youtube: { url: 'https://youtube.com/@userName' },
	// skype: { url: 'https://skype.com/userName' },
	// slack: { url: 'https://slack.com/userName' },
	// messenger: { url: 'https://messenger.com/userName' },
	// whatsapp: { url: 'https://whatsapp.com/userName' },
	// snapchat: { url: 'https://snapchat.com/userName' },
	// line: { url: 'https://line.com/userName' },
	// twitch: { url: 'https://twitch.com/userName' },
	// weibo: { url: 'https://weibo.com/userName' },
	// bilibili: { url: 'https://space.bilibili.com/userName' },
	// dingding: { url: 'https://dingtalk.com/userName' },
	// zhihu: { url: 'https://zhihu.com/userName' },
	// douban: { url: 'https://douban.com/userName' },
	// rss: { url: '/rss.xml' },
};

// doc: https://giscus.app
// data-theme is auto changed between noborder_light / noborder_gray
export const GiscusConfig: Record<string, string> = {
	'data-repo':"A-guohui/koupo_blog",
  'data-repo-id':"R_kgDOMmweSA",
  'data-category':"Announcements",
  'data-category-id':"DIC_kwDOMmweSM4ClSp3",
  'data-mapping':"pathname",
  'data-strict':"0",
  'data-reactions-enabled':"1",
  'data-emit-metadata':"0",
  'data-input-position':"top",
  'data-theme':"preferred_color_scheme",
  'data-lang':"zh-CN",
  'data-loading':"lazy",
  crossorigin:"anonymous",
	async: '',
};

export type HideElements =
	| PostHideElements
	| 'logo'
	| 'search'
	| 'themeToggler'
	| 'siteDescription'
	| 'footerDescription';
// Always hide elements from site
export const Hide: HideElements[] = [];
