'use client';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const formatDate = (date: any) => {
  if (!date) return '';
  if (typeof date === 'number') {
    // Convert Excel serial date to JS Date
    const jsDate = new Date((date - 25569) * 86400 * 1000);
    return jsDate.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  }
  return String(date);
};

const numberToWords = (num: any): string => {
  if (!num) return '';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n) || n === 0) return 'Zero Rupees Only';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (numStr: string) => {
    let n = parseInt(numStr);
    if (n === 0) return '';
    let word = '';
    if (n > 99) {
      word += a[Math.floor(n / 100)] + 'Hundred ';
      n = n % 100;
    }
    if (n > 19) {
      word += b[Math.floor(n / 10)] + ' ';
      n = n % 10;
    }
    if (n > 0) {
      word += a[n];
    }
    return word;
  };

  const strNum = Math.floor(n).toString();
  let res = '';

  if (strNum.length > 9) return 'Exceeds limit';

  let remaining = strNum;

  if (remaining.length > 7) {
    const crores = remaining.substring(0, remaining.length - 7);
    remaining = remaining.substring(remaining.length - 7);
    if (parseInt(crores) > 0) res += inWords(crores) + 'Crore ';
  }

  if (remaining.length > 5) {
    const lakhs = remaining.substring(0, remaining.length - 5);
    remaining = remaining.substring(remaining.length - 5);
    if (parseInt(lakhs) > 0) res += inWords(lakhs) + 'Lakh ';
  }

  if (remaining.length > 3) {
    const thousands = remaining.substring(0, remaining.length - 3);
    remaining = remaining.substring(remaining.length - 3);
    if (parseInt(thousands) > 0) res += inWords(thousands) + 'Thousand ';
  }

  if (parseInt(remaining) > 0) {
    res += inWords(remaining);
  }

  return res.trim() + ' Rupees Only';
};

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
                          {formatDate(invoice.Date)}
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
          className="mx-auto mt-8 max-w-[440px] bg-[#f8f9fe] shadow-sm relative overflow-hidden"
          style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
        >
          {/* Main Card Content */}
          <div className="px-8 pt-10 pb-8 bg-white border border-gray-100 relative z-10 m-4 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">

            {/* Logo */}
            <div className="mx-auto mb-6 flex justify-center w-full px-4">
              <img
                src="/MTC-VASAI-logo.png"
                alt="MTC-VASAI Logo"
                className="max-h-[120px] w-auto object-contain"
              />
            </div>

            {/* Title */}
            <h1 className="mb-2 text-center text-[22px] font-normal tracking-wide text-slate-800 uppercase leading-snug">
              CRT MRC MC MTC VASAI
            </h1>

            {/* Address */}
            <div className="text-center text-[13px] text-slate-600 font-medium leading-relaxed mb-8">
              Evershine City, Vasai
            </div>

            {/* Receipt Number & Date */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-1.5">Receipt No.</div>
                <div className="text-[15px] font-medium text-slate-800">{item.Receipt}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-1.5">Date</div>
                <div className="text-[15px] font-medium text-slate-800">{formatDate(item.Date)}</div>
              </div>
            </div>

            <div className="h-[1px] w-full bg-slate-100 mb-6"></div>

            {/* Received from */}
            <div className="mb-6 rounded-lg border border-indigo-50/60 bg-[#fbfbfe] py-4 px-5">
              <div className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-2.5">Received with thanks from</div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <div className="text-[17px] font-normal text-slate-800 tracking-wide">
                  {item.Title && item.Title.trim() ? `${item.Title} ` : ''}{item.Name}
                </div>
              </div>
            </div>

            {/* Received towards */}
            <div className="mb-4 pt-1">
              <div className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-2">Received towards</div>
              <div className="text-[14.5px] text-slate-800 mb-5 leading-snug">
                {item.Heading} {item.Description ? `(${item.Description})` : ''}
              </div>
            </div>

            <div className="w-full border-t border-dashed border-slate-200 mb-5"></div>

            {/* Total Contribution Box */}
            <div className="mb-6 rounded-xl bg-[#161332] p-5 shadow-[0_10px_25px_-5px_rgba(22,19,50,0.3)]">
              <div className="flex justify-between items-center mb-2">
                <div className="text-[9px] font-bold text-indigo-200/80 tracking-widest uppercase">Total Contribution</div>
                {/* <div className="rounded-full bg-indigo-500/90 px-3 py-1 text-[9px] font-bold tracking-wider text-white uppercase shadow-sm">Confirmed</div> */}
              </div>
              <div className="flex items-baseline mt-1">
                <span className="text-lg font-medium text-indigo-200/90 mr-2">Rs.</span>
                <span className="text-[36px] font-light tracking-tight text-white">
                  {item.Amount ? Number(item.Amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
              {/* Amount in Words */}
              <div className="mt-6">
                <div className="text-[10px] font-semibold text-white tracking-widest uppercase mb-2">Amount in words</div>
                <div className="text-[14px] italic text-white">
                  {numberToWords(item.Amount)}
                </div>
              </div>
            </div>

            {/* Computer Generated Info */}
            <div className="rounded-lg bg-[#f0f2fa] p-4 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-slate-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="ml-3 text-[11px] leading-relaxed text-slate-600 font-medium pr-2">
                This is a computer-generated document. No signature is required. All transactions are electronically recorded for institutional audit.
              </div>
            </div>

            {/* Abstract checkmark background watermark */}
            <div className="absolute right-[-10px] bottom-[60px] opacity-[0.02] pointer-events-none transform rotate-12 scale-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48 text-indigo-900" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Cheerful giver */}
            <div className="mt-8 text-center relative z-10 pb-2">
              <div className="text-[15px] italic text-[#4b4eeb] font-medium tracking-wide mb-1">&quot;God loves a cheerful giver.&quot;</div>
              <div className="text-[12px] text-slate-500 font-medium">Thank you for your support!</div>
            </div>

          </div>

          {/* Footer Area */}
          {/* <div className="pt-2 px-8 pb-8 relative bg-[#f8f9fe]">
            <div className="absolute top-0 left-0 w-full border-t border-dashed border-indigo-200/50"></div>
            <div className="text-center mb-3 mt-[18px]">
              <span className="text-[10px] font-bold text-[#161332] uppercase tracking-[0.15em]">Finance_Record</span>
            </div>
            <div className="text-center text-[9.5px] leading-relaxed text-slate-500 max-w-[300px] mx-auto mb-4 font-medium">
              © 2024 Institutional Records Management. All transactions are electronically recorded.
            </div>
            <div className="flex justify-center gap-[22px] text-[10px] text-slate-400 font-medium">
              <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-slate-600 cursor-pointer transition-colors">Compliance</span>
              <span className="hover:text-slate-600 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div> */}

        </div>
      ))}
    </div>
  );
};

export default UploadExcel;
