const PageNames = {
	HOME: "HOME",
	ME: "ME"
};
const Manifest = {
	"StarterPage": PageNames.ME,
	"Pages": {
		[PageNames.HOME]: 'js/pages/HomePage',
		[PageNames.ME]: 'js/pages/Me'
	}
};

export { Manifest, PageNames };