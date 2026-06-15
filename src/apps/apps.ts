export interface AppLink {
  title: string;
  description: string;
  href: string;
}

export const apps: AppLink[] = [
  {
    title: "奇门遁甲起盘",
    description: "QiMen DunJia chart calculator.",
    href: "/qimen/",
  },
  {
    title: "家庭点餐",
    description: "Simple family menu and order page.",
    href: "/menu/",
  },
];
