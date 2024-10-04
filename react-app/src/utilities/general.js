import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export const pdfToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = async function() {
            try {
                const typedarray = new Uint8Array(this.result);

                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                const numPages = pdf.numPages;

                const pageBase64Array = [];

                for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);

                    const scale = 1.5;
                    const viewport = page.getViewport({ scale });

                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    const context = canvas.getContext('2d');
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };

                    await page.render(renderContext).promise;

                    // Convert canvas to Base64 URL for the current page
                    const imgBase64 = canvas.toDataURL('image/png');
                    pageBase64Array.push(imgBase64);
                }

                resolve(pageBase64Array); // Return the array of Base64 URLs
            } catch (error) {
                reject(error);
            }
        };

        fileReader.onerror = (error) => reject(error);
        fileReader.readAsArrayBuffer(file);
    });
};

export function imageToBase64(imageFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onloadend = function() {
        resolve([reader.result]);
      };
  
      reader.onerror = function(error) {
        reject(error);
      };
  
      reader.readAsDataURL(imageFile);
    });
}

export const formatUserMessage = async (files, text) => {
    const base64Images = [];

    // Convert all pdfs to base64Images
    // for (const file of files) {
    //     if (file.type === "application/pdf") {
    //         try {
    //             const imgBase64 = await pdfToImage(file);
    //             base64Images.push(imgBase64);
    //         } catch (error) {
    //             console.error("Error processing PDF:", error);
    //         }
    //     }
    // }

    // Initialize chatgpt message item
    var output_json = {"role":"user", "content":[]}

    // Add all of the pdfs/images to content
    for (const file of files) {
        for (const pageNum in file.base64){
            output_json["content"].push(
                {
                    "type": "image_url",
                    "image_url": {
                        "url": file.base64[pageNum],
                    },
                },
            )
        }
    }

    // Add users message to content
    output_json["content"].push(
        {
            "type": "text",
            "text": text,
        },
    )

    return output_json;
};
  
export const formatAssistantMessage = (text) => {
    // Initialize chatgpt message item
    var output_json = {"role":"assistant", "content":text}

    return output_json;
};

export const getRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};