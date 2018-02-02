
export async function getCapabilities(url, { post = false, acceptVersions = ['1.0.0', '2.0.0'] }) {
  fetchAndCheck(url)
}
