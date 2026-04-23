const sampleMarkup = document.getElementById("htmlInput").value;
const htmlInput = document.getElementById("htmlInput");
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
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

let latestPngUrl = "";

const setStatus = (message, isError = false) => {
  status.textContent = message;
  status.classList.toggle("error", isError);
};

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
  const height = Number(heightInput.value);
  const background = backgroundInput.value.trim() || "transparent";

  if (!markup) {
    setStatus("HTML を入力してください", true);
    return;
  }

  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    setStatus("width / height は 1 以上の数値にしてください", true);
    return;
  }

  renderButton.disabled = true;
  downloadButton.disabled = true;
  setStatus("更新中...");

  try {
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
    pngOutput.src = latestPngUrl;
    downloadLink.href = latestPngUrl;
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
  htmlInput.value = sampleMarkup;
  renderHtmlToImage();
});

downloadButton.addEventListener("click", () => {
  if (latestPngUrl) {
    downloadLink.click();
  }
});

window.addEventListener("resize", () => {
  const width = Number(widthInput.value);
  const height = Number(heightInput.value);
  const background = backgroundInput.value.trim() || "transparent";

  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    updateHtmlPreview(htmlInput.value, width, height, background);
  }
});

renderHtmlToImage();
