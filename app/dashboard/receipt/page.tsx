'use client';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const UploadExcel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[][] | null>(null);
  const contentRef = useRef(null);
  const [jsonData, setJsonData] = useState<any>([]);
  var data: any[] | React.SetStateAction<null> = [];
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (evt) => {
        if (evt.target) {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          data = XLSX.utils.sheet_to_json(ws);
          // const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          console.log('data', data);
          setJsonData(data);
          console.log('jsonData', jsonData);
        }
      };
      reader.readAsBinaryString(file);
      if (event.target.files && event.target.files.length > 0) {
        setSelectedFile(event.target.files[0]);
      }
    }
  };

  const handleUploadImage = async () => {
    await generateImage();

  };

  const handleUploadPdf = async () => {
    await generatePDF();

  };

  const generatePDF = async () => {
    const zip = new JSZip();
    
    for (let i = 0; i < jsonData.length; i++) {
      const element = document.getElementById(i + 'id');
      if (element != null) {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', [element.offsetHeight * 0.2645833333, element.offsetWidth * 0.2645833333]);
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        const pdfBlob = pdf.output('blob');
        zip.file(jsonData[i].Mobile + "-" + jsonData[i].Name + "-" + jsonData[i].Receipt + ".pdf", pdfBlob);
      }
    }
  
    const months = ["Jan", "Feb", "Mar", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'MTC-VASAI-receipts-pdf' + '-' + new Date().getDate() + '-' + months[new Date().getMonth()] + '-' + new Date().getFullYear() + '.zip');
  };
  

    // Generate zip folder once all PDFs are generated
  //};

  const generateImage = async () => {
    const zipImg = new JSZip();
  
    for (let j = 0; j < jsonData.length; j++) {
      const elementImg = document.getElementById(j + 'id');
      if (elementImg != null) {
        const canvas = await html2canvas(elementImg, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgName = jsonData[j].Mobile + "-" + jsonData[j].Name + "-" + jsonData[j].Receipt + ".png";
        zipImg.file(imgName, imgData.split('base64,')[1], { base64: true });
      }
    }
  
    const months = ["Jan", "Feb", "Mar", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const zipBlob = await zipImg.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'MTC-VASAI-receipts-image' + '-' + new Date().getDate() + '-' + months[new Date().getMonth()] + '-' + new Date().getFullYear() + '.zip');
  };
  
  return (
    <div className="mt-6 flow-root">
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button
        className="items-center rounded-lg bg-violet-600 p-3 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        onClick={handleUploadPdf}
      >
        Download Pdf
      </button>
      <button
        className="mb-10 ml-5 items-center rounded-lg bg-violet-600 p-3 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        onClick={handleUploadImage}
      >
        Download Image
      </button>
      {/* <button
        className="mb-10 ml-5 items-center rounded-lg bg-violet-600 p-3 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        onClick={handleUploadPdf}
      >
        Whatsapp Push
      </button> */}
      {jsonData && jsonData[0] && (
        <div>
          {/* <table>
            <tbody ref={contentRef}>
              {jsonData.map((item: any, index: any) => (
                <tr key={index}>
                  <td>{item.number}</td>
                  <td>{item.Receipt}</td>
                  <td>{item.Name}</td>
                  <td>{item.Date}</td>
                  <td>{item.Heading}</td>
                  <td>{item.Description}</td>
                  <td>{item.Amount}</td>
                  <td>{item.Mode}</td>
                  <td>{item.Mobile}</td>
                </tr>
              ))}
            </tbody>
          </table> */}
          <div className="mt-6 flow-root ">
            <div className="inline-block min-w-full align-middle">
              <div className="rounded-lg bg-violet-400 p-2 md:pt-0">
                <table className="hidden min-w-full text-gray-900 md:table">
                  <thead className="rounded-lg text-left text-sm font-normal">
                    <tr>
                      <th scope="col" className="px-3 py-5 font-medium">
                        Sr. No.
                      </th>
                      <th scope="col" className="px-3 py-5 font-medium">
                        Receipt No.
                      </th>
                      <th scope="col" className="px-3 py-5 font-medium">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                        Member
                      </th>
                      <th scope="col" className="px-3 py-5 font-medium">
                        Received towards
                      </th>
                      <th scope="col" className="px-3 py-5 font-medium">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-5 font-medium">
                        Mobile No.
                      </th>
                      <th scope="col" className="relative py-3 pl-6 pr-3">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {jsonData?.map((invoice: any, index: any) => (
                      <tr
                        key={index}
                        className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                      >
                        <td className="whitespace-nowrap px-3 py-3">
                          {invoice.Number}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {invoice.Receipt}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {invoice.Date}
                        </td>
                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            {/* <Image
                            src={invoice.image_url}
                            className="rounded-full"
                            width={28}
                            height={28}
                            alt={`${invoice.name}'s profile picture`}
                          /> */}
                            <p>{invoice.Name}</p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {invoice.Heading}
                          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                            {invoice.Description}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          Rs. {invoice.Amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {invoice.Mobile}
                        </td>
                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                          <div className="flex justify-end gap-3">
                            {/* <UpdateInvoice id={invoice.id} />
                          <DeleteInvoice id={invoice.id} /> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {jsonData.map((item: any, index: any) => (
        <div
          key={index}
          id={index + 'id'}
          className="mx-auto mt-4 max-w-md rounded-3xl border-4 border-violet-500/75 bg-gray-100 px-6 py-2 shadow-2xl"
        >
          <div className="flex items-center justify-center">
            <Image
              src="/MTC-VASAI-logo.png"
              alt="MTC-VASAI"
              width={75}
              height={75}
              sizes="(max-width: 640px) 100px, 200px"
            />
          </div>
          <div className="">
            <h1 className="my-4 text-center text-2xl font-bold text-violet-600">
              CRT MRC MC MTC-VASAI - Kalyan
            </h1>
          </div>

          <div className="text-center text-gray-700 ">
            Opp. State Bank of India, Murbad road,
          </div>
          <div className="mb-10 text-center text-gray-700">
            Kalyan (W) - 421301
          </div>
          <div className="mb-6 flex justify-between">
            <span className="text-left rounded-md px-2 py-1 text-lg font-medium text-purple-700">Receipt no.: {item.Receipt}</span>

            <div className="text-gray-700">
              <div>Date: {item.Date}</div>
              {/* <div>Invoice #: INV12345</div> */}
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-sm">
              Received with thanks from:
            </h2>
            <h2 className="mb-4 text-lg">
              {item.Title} {item.Name}
            </h2>
            <div className="mb-2 text-violet-700"></div>
            {/* <div className="text-gray-700 mb-2">123 Main St.</div>
            <div className="text-gray-700 mb-2">Anytown, USA 12345</div>
            <div className="text-gray-700">johndoe@example.com</div> */}
          </div>
          <table className="mb-8 w-full">
            <thead>
              <tr>
                <th className="mb-6 text-left font-bold text-gray-700">
                  Received towards
                </th>
                <th className="text-right font-bold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-left text-gray-700">{item.Heading}</td>
                <td className="text-right text-gray-700">Rs. {item.Amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})}</td>         
              </tr>
              <tr>
                <td className="text-wrap mb-10 pr-20 text-left text-xs italic text-gray-700">
                  ({item.Description})
                </td>
              </tr>
              {/* <tr>
                <td className="text-left font-bold text-gray-500">Payment mode</td>
                <td className="text-right font-bold text-gray-500 italic">{item.Mode}</td>
              </tr> */}
            </tbody>
            <tfoot>
              {/* <tr>
                <td className="text-left font-bold text-gray-500">Payment mode</td>
                <td className="text-right font-bold text-gray-500 italic">{item.Mode}</td>
              </tr> */}
            </tfoot>
          </table>
          <div className="mb-8 text-left font-bold text-gray-500">
          Amt. in words: {item.Words}
          </div>
          <div className="mb-2 text-center text-gray-700">
            Thank you for your support!
          </div>
          <div className="mb-4 text-center text-sm text-gray-700">
            God loves a cheerful giver.
          </div>
          <div className="text-center text-xs italic text-gray-400">
            This is a computer-generated document. No signature is required.
          </div>
        </div>
      ))}
    </div>
  );
};

export default UploadExcel;
