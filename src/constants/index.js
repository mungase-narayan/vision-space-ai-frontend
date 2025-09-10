import QUERY from "./query";

export const URLS = {
  AI_BASE_URL: import.meta.env.VITE_AI_BASE_URL,
  BASE_URL: import.meta.env.VITE_BASE_URL,
  GOOGLE_CALLBACK_URL: import.meta.env.VITE_GOOGLE_CALLBACK_URL,
  LOGO_URL: import.meta.env.VITE_LOGO_URL,
  DARK_LOGO_URL: import.meta.env.VITE_DARK_LOGO_URL,
  LOGO_TEXT: import.meta.env.VITE_LOGO_TEXT,
};

export const COLORS = ["#CFC7FF", "#FFE9A1", "#B7EB8F", "#CFC7FF", "#FFBB96"];

export const NAV_LINKS = [];

export const EXT_COLOR = {
  UNKNOWN: "bg-gray-400",
  PPT: "bg-yellow-400",
  CSV: "bg-green-400",
  DOC: "bg-orange-400",
  PDF: "bg-blue-400",
  IMAGE: "bg-red-400",
  VIDEO: "bg-indigo-400",
  AUDIO: "bg-sky-400",
  TEXT: "bg-pink-400",
  ARCHIVE: "bg-purple-400",
};

export { QUERY };
