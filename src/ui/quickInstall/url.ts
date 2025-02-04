import { findByProps } from "@metro/filters";
import { PROXY_PREFIX } from "@lib/constants";
import { after } from "@lib/patcher";
import { installPlugin } from "@lib/plugins";
import { installTheme } from "@lib/themes";
import { getAssetIDByName } from "@ui/assets";
import { showToast } from "@ui/toasts";

const showSimpleActionSheet = findByProps("showSimpleActionSheet");

export default () => after("showSimpleActionSheet", showSimpleActionSheet, (args) => {
    if (args[0].key !== "LongPressUrl") return;

    const { header: { title: url }, options } = args[0];

    let urlType: string;
    if (url.startsWith(PROXY_PREFIX)) {
        urlType = "Plugin";
    } else if (url.endsWith(".json") && window.__vendetta_loader?.features.themes) {
        urlType = "Theme";
    } else return;

    options.push({
        label: `Install ${urlType}`, onPress: () =>
            (urlType === "Plugin" ? installPlugin : installTheme)(url).then(() => {
                showToast("Successfully installed", getAssetIDByName("Check"));
            }).catch((e: Error) => {
                showToast(e.message, getAssetIDByName("Small"));
            }),
    });
});