export function parseInitData(initData: string) {
  if (!initData) return {};
  const urlParams = new URLSearchParams(initData);
  const userRaw = urlParams.get("user");
  if (!userRaw) return {};
  try {
    return { user: JSON.parse(userRaw) };
  } catch (e) {
    console.error("Ошибка при парсинге user", e);
    return {};
  }
}
