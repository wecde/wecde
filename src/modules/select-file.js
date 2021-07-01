export default function (type, multiple = false) {
  const input = document.createElement("input");
  document
    .querySelectorAll('input[data-type="select-file"]')
    .forEach((item) => {
      item.remove();
    });
  input.setAttribute("type", "file");
  input.setAttribute("multiple", multiple);
  input.setAttribute("accept", type);
  input.setAttribute("hidden", true);
  input.setAttribute("data-type", "select-file");

  const promise = new Promise((resolve, reject) => {
    input.addEventListener(
      "change",
      () => {
        resolve(input.files);
        input.remove();
      },
      {
        once: true,
      }
    );
    input.addEventListener(
      "blur",
      () => {
        if (input.files.length === 0) {
          reject();
        } else {
          resolve(input.files);
        }
        input.remove();
      },
      {
        once: true,
      }
    );
  });

  document.body.append(input);
  input.click();

  return promise;
}

export function fileToBuffer(file) {
  const reader = new FileReader();

  const promise = new Promise((resolve, reject) => {
    reader.addEventListener(
      "load",
      () => {
        resolve(new Uint8Array(reader.result));
      },
      {
        once: true,
      }
    );
    reader.addEventListener(
      "error",
      () => {
        reject();
      },
      {
        once: true,
      }
    );
  });

  reader.readAsArrayBuffer(file);

  return promise;
}
