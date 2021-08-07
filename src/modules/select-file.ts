export default function (type?: string, multiple = false): Promise<readonly File[]> {
  const input = document.createElement("input");
  document
    .querySelectorAll('input[data-type="select-file"]')
    .forEach((item) => {
      item.remove();
    });
  input.setAttribute("type", "file");
  if (multiple) {
    input.setAttribute("multiple", "multiple");
  }
  if (type) {
    input.setAttribute("accept", type);
  }

  input.setAttribute("hidden", "hidden");
  input.setAttribute("data-type", "select-file");

  const promise = new Promise<readonly File[]>((resolve, reject) => {
    input.addEventListener(
      "change",
      () => {
        resolve(Array.from<File>(input.files || []));
        input.remove();
      },
      {
        once: true,
      }
    );
    input.addEventListener(
      "blur",
      () => {
        if (input.files?.length === 0) {
          reject();
        } else {
          resolve(Array.from<File>(input.files || []));
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

export function fileToBuffer(file: File): Promise<ArrayBuffer> {
  const reader = new FileReader();

  const promise = new Promise<ArrayBuffer>((resolve, reject) => {
    reader.addEventListener(
      "load",
      () => {
        resolve(reader.result as ArrayBuffer);
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
