const PageNames = {
	HOME: "HOME",
	ME: "ME",
	BLOG: "BLOG"
};
const Manifest = {
	"StarterPage": PageNames.ME,
	"Pages": {
		[PageNames.HOME]: 'js/pages/HomePage',
		[PageNames.ME]: 'js/pages/Me',
		[PageNames.BLOG]: 'js/pages/Blog'
	}
};

export { Manifest, PageNames };