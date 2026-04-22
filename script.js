const sampleMarkup = document.getElementById("htmlInput").value;
const htmlInput = document.getElementById("htmlInput");
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const scaleInput = document.getElementById("scaleInput");
const backgroundInput = document.getElementById("backgroundInput");
const renderButton = document.getElementById("renderButton");
const sampleButton = document.getElementById("sampleButton");
const downloadButton = document.getElementById("downloadButton");
const status = document.getElementById("status");
const canvas = document.getElementById("previewCanvas");
const pngOutput = document.getElementById("pngOutput");
const downloadLink = document.getElementById("downloadLink");

let latestPngUrl = "";

const setStatus = (message, isError = false) => {
  status.textContent = message;
  status.style.color = isError ? "#b91c1c" : "";
};

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const svgToImage = (svgMarkup) =>
  new Promise((resolve, reject) => {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(blobUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("SVG の読み込みに失敗しました"));
    };

    image.src = blobUrl;
  });

async function renderHtmlToImage() {
  const markup = htmlInput.value.trim();
  const width = Number(widthInput.value);
  const height = Number(heightInput.value);
  const scale = Number(scaleInput.value);
  const background = backgroundInput.value.trim() || "transparent";

  if (!markup) {
    setStatus("HTML を入力してください", true);
    return;
  }

  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    setStatus("width / height は 1 以上の数値にしてください", true);
    return;
  }

  if (!Number.isFinite(scale) || scale < 1 || scale > 4) {
    setStatus("scale は 1 から 4 の範囲で指定してください", true);
    return;
  }

  renderButton.disabled = true;
  downloadButton.disabled = true;
  setStatus("変換中...");

  try {
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
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.aspectRatio = `${width} / ${height}`;

    const context = canvas.getContext("2d");
    context.setTransform(scale, 0, 0, scale, 0, 0);
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
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("PNG 生成に失敗しました"));
      }, "image/png");
    });

    latestPngUrl = URL.createObjectURL(pngBlob);
    pngOutput.src = latestPngUrl;
    downloadLink.href = latestPngUrl;
    downloadButton.disabled = false;
    setStatus(`生成完了: ${width}x${height} / scale ${scale}`);
  } catch (error) {
    console.error(error);
    setStatus(error.message || "変換に失敗しました", true);
  } finally {
    renderButton.disabled = false;
  }
}

renderButton.addEventListener("click", () => {
  renderHtmlToImage();
});

sampleButton.addEventListener("click", () => {
  htmlInput.value = sampleMarkup;
  setStatus("サンプル HTML を復元しました");
});

downloadButton.addEventListener("click", () => {
  if (!latestPngUrl) {
    return;
  }
  downloadLink.click();
});

renderHtmlToImage();
