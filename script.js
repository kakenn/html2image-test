const sampleSelect = document.getElementById("sampleSelect");
const htmlInput = document.getElementById("htmlInput");
const widthInput = document.getElementById("widthInput");
const backgroundInput = document.getElementById("backgroundInput");
const renderButton = document.getElementById("renderButton");
const sampleButton = document.getElementById("sampleButton");
const downloadButton = document.getElementById("downloadButton");
const status = document.getElementById("status");
const canvas = document.getElementById("previewCanvas");
const pngOutput = document.getElementById("pngOutput");
const downloadLink = document.getElementById("downloadLink");
const htmlPreview = document.getElementById("htmlPreview");
const htmlPreviewShell = document.getElementById("htmlPreviewShell");
const measureSurface = document.getElementById("measureSurface");

let latestPngUrl = "";
let lastRenderedSize = { width: 0, height: 0 };

const sampleDefinitions = {
  simple: `<div style="width:100%;min-height:630px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f766e 0%,#f59e0b 100%);color:white;font-family:'Hiragino Sans','Yu Gothic',sans-serif;">
  <div style="padding:36px 44px;border:1px solid rgba(255,255,255,.35);border-radius:28px;background:rgba(255,255,255,.12);box-shadow:0 18px 50px rgba(0,0,0,.18);text-align:center;">
    <div style="font-size:14px;letter-spacing:.24em;text-transform:uppercase;opacity:.85;">Client-side only</div>
    <h1 style="margin:12px 0 8px;font-size:44px;line-height:1;">HTML → Image</h1>
    <p style="margin:0;font-size:18px;opacity:.92;">HTML preview と image preview を並べて確認</p>
  </div>
</div>`,
  game_notice_stable: `<div style="width:100%;min-height:630px;padding:36px;background:linear-gradient(135deg,#111827 0%,#1d4ed8 55%,#0f766e 100%);color:#fff;font-family:'Hiragino Sans','Yu Gothic',sans-serif;box-sizing:border-box;">
  <div style="padding:34px;border-radius:30px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);box-shadow:0 20px 50px rgba(0,0,0,.22);">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;">
      <div>
        <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:#f59e0b;color:#111827;font-size:13px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;">
          Limited Event
        </div>
        <div style="margin-top:18px;font-size:58px;font-weight:800;line-height:1.02;letter-spacing:-.04em;">
          黄金祭アリーナ 開催
        </div>
        <div style="margin-top:14px;font-size:23px;line-height:1.55;opacity:.94;">
          新ボス「雷槍ヴァルグ」が登場。イベント限定装備、ログイン報酬、
          スコアアタック報酬が同時追加。
        </div>
      </div>
      <div style="width:200px;padding:18px;border-radius:24px;background:rgba(255,255,255,.12);text-align:center;">
        <div style="font-size:12px;letter-spacing:.22em;text-transform:uppercase;opacity:.72;">開催期間</div>
        <div style="margin-top:10px;font-size:24px;font-weight:800;line-height:1.25;">4/25 18:00</div>
        <div style="font-size:18px;font-weight:700;opacity:.92;">- 5/2 11:59</div>
      </div>
    </div>
    <div style="margin-top:26px;display:flex;gap:16px;">
      <div style="flex:1;padding:18px 20px;border-radius:22px;background:rgba(255,255,255,.12);">
        <div style="font-size:14px;letter-spacing:.18em;text-transform:uppercase;opacity:.74;">Update 01</div>
        <div style="margin-top:8px;font-size:26px;font-weight:800;">限定 SSR 武器を追加</div>
      </div>
      <div style="flex:1;padding:18px 20px;border-radius:22px;background:rgba(255,255,255,.12);">
        <div style="font-size:14px;letter-spacing:.18em;text-transform:uppercase;opacity:.74;">Update 02</div>
        <div style="margin-top:8px;font-size:26px;font-weight:800;">ランキング報酬を強化</div>
      </div>
      <div style="flex:1;padding:18px 20px;border-radius:22px;background:rgba(255,255,255,.12);">
        <div style="font-size:14px;letter-spacing:.18em;text-transform:uppercase;opacity:.74;">Update 03</div>
        <div style="margin-top:8px;font-size:26px;font-weight:800;">毎日 10 連無料チケット</div>
      </div>
    </div>
    <div style="margin-top:24px;display:flex;justify-content:space-between;align-items:center;gap:20px;">
      <div style="font-size:20px;line-height:1.5;opacity:.86;">
        今すぐ参加して限定フレームと 3,000 ジェムを獲得しよう
      </div>
      <div style="padding:16px 24px;border-radius:999px;background:#f59e0b;color:#111827;font-size:20px;font-weight:800;">
        EVENT PLAY NOW
      </div>
    </div>
  </div>
</div>`,
  game_notice_stress: `<div style="position:relative;width:100%;min-height:630px;overflow:hidden;background:
radial-gradient(circle at 20% 30%, rgba(59,130,246,.9), transparent 28%),
radial-gradient(circle at 80% 20%, rgba(236,72,153,.85), transparent 24%),
radial-gradient(circle at 60% 80%, rgba(34,197,94,.8), transparent 26%),
linear-gradient(135deg,#0f172a 0%,#111827 100%);font-family:'Hiragino Sans','Yu Gothic',sans-serif;">
  <div style="position:absolute;left:78px;top:84px;width:340px;height:340px;border-radius:50%;background:#22c55e;mix-blend-mode:screen;filter:blur(10px);opacity:.78;"></div>
  <div style="position:absolute;left:260px;top:38px;width:320px;height:320px;border-radius:50%;background:#3b82f6;mix-blend-mode:screen;filter:blur(10px);opacity:.78;"></div>
  <div style="position:absolute;left:196px;top:206px;width:320px;height:320px;border-radius:50%;background:#ec4899;mix-blend-mode:screen;filter:blur(10px);opacity:.82;"></div>
  <div style="position:absolute;right:78px;top:54px;width:250px;height:250px;border-radius:34px;background:linear-gradient(135deg,rgba(255,255,255,.14),rgba(255,255,255,.05));border:1px solid rgba(255,255,255,.22);transform:rotate(14deg);backdrop-filter:blur(18px) saturate(1.4);box-shadow:0 24px 60px rgba(0,0,0,.24);"></div>
  <div style="position:absolute;right:108px;top:86px;width:250px;height:250px;border-radius:34px;border:2px solid rgba(255,255,255,.6);transform:rotate(5deg);"></div>
  <div style="position:absolute;inset:42px;border-radius:34px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(6px);padding:34px;color:#fff;overflow:hidden;">
    <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.14);font-size:13px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;">
      Urgent Update
    </div>
    <div style="margin-top:18px;font-size:64px;font-weight:900;line-height:.98;letter-spacing:-.07em;text-shadow:0 8px 20px rgba(0,0,0,.24);">
      超襲来 ⚔️<br>VOID DRAGON
    </div>
    <div style="margin-top:16px;max-width:760px;font-size:24px;line-height:1.5;letter-spacing:.03em;opacity:.96;">
      48時間限定レイド。特殊演出、重なりカード、ガラス風 UI、絵文字、強い字詰めを混ぜた差異確認用のゲーム告知。
    </div>
    <div style="position:absolute;left:36px;right:36px;bottom:34px;display:flex;gap:16px;">
      <div style="flex:1;padding:18px 20px;border-radius:22px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);">
        <div style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;opacity:.72;">Reward</div>
        <div style="margin-top:8px;font-size:28px;font-weight:800;">限定称号 + 召喚石</div>
      </div>
      <div style="flex:1;padding:18px 20px;border-radius:22px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);">
        <div style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;opacity:.72;">Period</div>
        <div style="margin-top:8px;font-size:28px;font-weight:800;">4/26 12:00 - 4/28 23:59</div>
      </div>
    </div>
  </div>
</div>`,
  news_article: `<article style="width:100%;padding:44px;background:#f8fafc;color:#0f172a;font-family:'Hiragino Sans','Yu Gothic',sans-serif;box-sizing:border-box;">
  <div style="max-width:920px;margin:0 auto;padding:40px 44px;background:#ffffff;border:1px solid rgba(15,23,42,.08);border-radius:28px;box-shadow:0 20px 44px rgba(15,23,42,.08);">
    <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;">
      News
    </div>
    <h1 style="margin:18px 0 0;font-size:54px;line-height:1.08;letter-spacing:-.04em;">
      新シーズン「蒼穹の境界線」4月30日開幕
    </h1>
    <div style="margin-top:14px;font-size:15px;color:#64748b;">
      2026.04.30 12:00 公開
    </div>
    <p style="margin:24px 0 0;font-size:24px;line-height:1.7;color:#334155;">
      新マップ、新ストーリー、期間限定ミッションを含む大型アップデートを実施します。あわせてバランス調整と新規プレイヤー向け施策も追加されます。
    </p>
    <h2 style="margin:34px 0 0;font-size:28px;line-height:1.3;">アップデート概要</h2>
    <p style="margin:14px 0 0;font-size:20px;line-height:1.9;color:#334155;">
      今回のアップデートでは、メインストーリー第 5 部の開始に加え、空中都市を舞台にした新エリア「アステラ回廊」を実装します。
      また、シーズン進行にあわせてイベントボス、ログインボーナス、特別ショップも順次開放されます。
    </p>
    <h2 style="margin:34px 0 0;font-size:28px;line-height:1.3;">主な追加内容</h2>
    <ul style="margin:14px 0 0;padding-left:1.4em;font-size:20px;line-height:1.9;color:#334155;">
      <li>新マップ「アステラ回廊」追加</li>
      <li>メインストーリー第 5 部公開</li>
      <li>期間限定ミッションとログイン報酬</li>
      <li>一部武器スキルと PvP バランス調整</li>
    </ul>
    <div style="margin-top:34px;padding-top:22px;border-top:1px solid rgba(15,23,42,.08);font-size:17px;line-height:1.8;color:#64748b;">
      詳細な更新内容はゲーム内お知らせおよび公式サイトのパッチノートをご確認ください。
    </div>
  </div>
</article>`
};

const setStatus = (message, isError = false) => {
  status.textContent = message;
  status.classList.toggle("error", isError);
};

const loadSelectedSample = () => {
  const selectedMarkup = sampleDefinitions[sampleSelect.value];
  if (selectedMarkup) {
    htmlInput.value = selectedMarkup;
  }
};

const getDownloadFileName = () => {
  const { width, height } = lastRenderedSize;
  return `html-image-${width}x${height}.png`;
};

const nextFrame = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const svgMarkupToDataUrl = (svgMarkup) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("SVG データ URL の生成に失敗しました"));
    reader.readAsDataURL(blob);
  });

const svgToImage = async (svgMarkup) => {
  const dataUrl = await svgMarkupToDataUrl(svgMarkup);

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("SVG の読み込みに失敗しました"));
    image.src = dataUrl;
  });
};

const measureMarkupHeight = async (markup, width, background) => {
  measureSurface.style.width = `${width}px`;
  measureSurface.style.background = background;
  measureSurface.innerHTML = markup;
  await nextFrame();
  const measuredHeight = Math.ceil(measureSurface.getBoundingClientRect().height);
  measureSurface.innerHTML = "";
  return Math.max(measuredHeight, 1);
};

const updateHtmlPreview = (markup, width, height, background) => {
  htmlPreviewShell.style.width = `${width}px`;
  htmlPreviewShell.style.height = `${height}px`;
  htmlPreview.style.width = `${width}px`;
  htmlPreview.style.height = `${height}px`;
  htmlPreview.style.background = background;
  htmlPreview.innerHTML = markup;

  requestAnimationFrame(() => {
    const stage = htmlPreviewShell.parentElement;
    const scale = Math.min(stage.clientWidth / width, 1);
    htmlPreviewShell.style.transform = `scale(${scale})`;
    stage.style.minHeight = `${Math.max(height * scale + 24, 180)}px`;
  });
};

async function renderHtmlToImage() {
  const markup = htmlInput.value.trim();
  const width = Number(widthInput.value);
  const background = backgroundInput.value.trim() || "transparent";

  if (!markup) {
    setStatus("HTML を入力してください", true);
    return;
  }

  if (!Number.isFinite(width) || width < 1) {
    setStatus("width は 1 以上の数値にしてください", true);
    return;
  }

  renderButton.disabled = true;
  downloadButton.disabled = true;
  setStatus("更新中...");

  try {
    const height = await measureMarkupHeight(markup, width, background);
    updateHtmlPreview(markup, width, height, background);

    const svgMarkup = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `<foreignObject width="100%" height="100%">`,
      `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;overflow:hidden;background:${escapeXml(background)};">`,
      markup,
      `</div>`,
      `</foreignObject>`,
      `</svg>`
    ].join("");

    const image = await svgToImage(svgMarkup);
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    if (background !== "transparent") {
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(image, 0, 0, width, height);

    if (latestPngUrl) {
      URL.revokeObjectURL(latestPngUrl);
    }

    const pngBlob = await new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
            return;
          }
          reject(new Error("PNG 生成に失敗しました"));
        }, "image/png");
      } catch (error) {
        reject(error);
      }
    });

    latestPngUrl = URL.createObjectURL(pngBlob);
    lastRenderedSize = { width, height };
    pngOutput.src = latestPngUrl;
    downloadLink.href = latestPngUrl;
    downloadLink.download = getDownloadFileName();
    downloadButton.disabled = false;
    setStatus(`更新完了: ${width}x${height}`);
  } catch (error) {
    console.error(error);
    if (error instanceof DOMException && error.name === "SecurityError") {
      setStatus("canvas が汚染されました。外部画像・外部フォント・foreignObject 制約を確認してください", true);
    } else {
      setStatus(error.message || "変換に失敗しました", true);
    }
  } finally {
    renderButton.disabled = false;
  }
}

renderButton.addEventListener("click", () => {
  renderHtmlToImage();
});

sampleButton.addEventListener("click", () => {
  loadSelectedSample();
  renderHtmlToImage();
});

sampleSelect.addEventListener("change", () => {
  loadSelectedSample();
  renderHtmlToImage();
});

downloadButton.addEventListener("click", () => {
  if (latestPngUrl) {
    downloadLink.download = getDownloadFileName();
    downloadLink.click();
  }
});

window.addEventListener("resize", () => {
  const width = Number(widthInput.value);
  const background = backgroundInput.value.trim() || "transparent";

  if (Number.isFinite(width) && width > 0 && lastRenderedSize.height > 0) {
    updateHtmlPreview(htmlInput.value, width, lastRenderedSize.height, background);
  }
});

loadSelectedSample();
renderHtmlToImage();
