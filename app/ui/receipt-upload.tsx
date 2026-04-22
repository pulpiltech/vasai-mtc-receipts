"use client";

import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const UploadExcel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[][] | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    console.log("handleUpload")
    if (selectedFile) {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target) {
          const data = event.target.result;
          console.log("data", data)
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const excelData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
          setExcelData(excelData);
        }
      };
      fileReader.readAsBinaryString(selectedFile);
    } else {
      console.log('No file selected.');
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
      />
      <button className="ml-5 mt-10 flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" 
      onClick={handleUpload}>Upload</button>
      {excelData && (
        <div>
          <h2>Excel Data:</h2>
          <table>
            <tbody>
              {excelData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UploadExcel;
