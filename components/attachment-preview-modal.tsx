"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { Download, Trash, Upload, X, FileText, File, FileImage, FileSpreadsheet } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Attachment {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  uploadedBy: string
  url?: string
  content?: string // For CSV content
}

interface AttachmentPreviewModalProps {
  attachment: Attachment | null
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onReplace: (id: string, file: File) => void
}

export function AttachmentPreviewModal({
  attachment,
  isOpen,
  onClose,
  onDelete,
  onReplace,
}: AttachmentPreviewModalProps) {
  const [isReplacing, setIsReplacing] = useState(false)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [docxContent, setDocxContent] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("preview")
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (attachment?.type === "text/csv" && attachment.url) {
      // For demo purposes, we'll use a mock CSV content
      const mockCsvContent = 
        "Name,Email,Role,Department\n" +
        "John Doe,john@example.com,Developer,Engineering\n" +
        "Jane Smith,jane@example.com,Designer,Design\n" +
        "Bob Johnson,bob@example.com,Manager,Operations\n" +
        "Alice Brown,alice@example.com,Analyst,Finance\n" +
        "Charlie Wilson,charlie@example.com,Marketer,Marketing";
      
      const rows = mockCsvContent.split('\n').map(row => row.split(','));
      setCsvData(rows);
    }

    if (attachment?.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // For demo purposes, we'll use mock DOCX content
      const mockDocxContent = `
        <div style="font-family: 'Calibri', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2b579a; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Project Requirements Document</h1>
          
          <h2 style="color: #2b579a; margin-top: 20px;">1. Introduction</h2>
          <p>This document outlines the requirements for the Website Redesign project. The goal is to improve user experience, increase engagement, and boost conversion rates through modern design principles and the latest web technologies.</p>
          
          <h2 style="color: #2b579a; margin-top: 20px;">2. Project Scope</h2>
          <p>The project includes the following components:</p>
          <ul style="margin-left: 20px;">
            <li>Complete redesign of the company website</li>
            <li>Implementation of responsive design for all devices</li>
            <li>Integration with existing CMS</li>
            <li>SEO optimization</li>
            <li>Performance improvements</li>
          </ul>
          
          <h2 style="color: #2b579a; margin-top: 20px;">3. Timeline</h2>
          <p>The project will be completed in three phases:</p>
          <ol style="margin-left: 20px;">
            <li><strong>Discovery and Planning:</strong> 2 weeks</li>
            <li><strong>Design and Development:</strong> 8 weeks</li>
            <li><strong>Testing and Launch:</strong> 2 weeks</li>
          </ol>
          
          <h2 style="color: #2b579a; margin-top: 20px;">4. Budget</h2>
          <p>The total budget for this project is $25,000, allocated as follows:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr style="background-color: #f3f3f3;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Category</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Amount</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Design</td>
              <td style="border: 1px solid #ddd; padding: 8px;">$8,000</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Development</td>
              <td style="border: 1px solid #ddd; padding: 8px;">$12,000</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Testing</td>
              <td style="border: 1px solid #ddd; padding: 8px;">$3,000</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Contingency</td>
              <td style="border: 1px solid #ddd; padding: 8px;">$2,000</td>
            </tr>
          </table>
          
          <h2 style="color: #2b579a; margin-top: 20px;">5. Team</h2>
          <p>The project team consists of:</p>
          <ul style="margin-left: 20px;">
            <li>Project Manager: John Doe</li>
            <li>Lead Designer: Jane Smith</li>
            <li>Frontend Developer: Mike Johnson</li>
            <li>Backend Developer: Sarah Wilson</li>
          </ul>
          
          <div style="margin-top: 40px; color: #666; font-size: 12px; text-align: center;">
            <p>This document is confidential and proprietary to Tech Innovations Inc.</p>
          </div>
        </div>
      `;
      
      setDocxContent(mockDocxContent);
    }

    // Reset image error state when attachment changes
    setImageError(false);
    
    // Reset active tab to preview when attachment changes
    setActiveTab("preview");
  }, [attachment]);

  if (!attachment) return null

  const isImage = attachment.type.startsWith("image/")
  const isPdf = attachment.type === "application/pdf"
  const isCsv = attachment.type === "text/csv"
  const isDocx = attachment.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  const isPng = attachment.type === "image/png"
  const isJpg = attachment.type === "image/jpeg" || attachment.type === "image/jpg"
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleReplace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onReplace(attachment.id, files[0])
      setIsReplacing(false)
      onClose()
    }
  }

  const handleDelete = () => {
    onDelete(attachment.id)
    onClose()
  }

  const getFileIcon = () => {
    if (isImage) return <FileImage className="h-16 w-16 text-muted-foreground mb-4" />
    if (isPdf) return <FileText className="h-16 w-16 text-muted-foreground mb-4" />
    if (isCsv) return <FileSpreadsheet className="h-16 w-16 text-muted-foreground mb-4" />
    return <File className="h-16 w-16 text-muted-foreground mb-4" />
  }

  const handleImageError = () => {
    setImageError(true);
  }

  // For demo purposes, we'll use placeholder URLs
  const pdfUrl = attachment.url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  const imageUrl = attachment.url || `https://source.unsplash.com/random/800x600?sig=${attachment.id}`

  const renderPreview = () => {
    if (isImage && !imageError) {
      return (
        <div className="flex items-center justify-center bg-muted/20 rounded-md p-4">
          <img 
            src={imageUrl} 
            alt={attachment.name}
            className="max-w-full max-h-[500px] object-contain rounded-md"
            onError={handleImageError}
          />
        </div>
      )
    } else if (isPdf) {
      return (
        <div className="w-full h-[600px] border rounded-md overflow-hidden">
          <iframe 
            src={pdfUrl}
            className="w-full h-full"
            title={attachment.name}
          />
        </div>
      )
    } else if (isCsv && csvData.length > 0) {
      return (
        <ScrollArea className="w-full h-[500px]">
          <div className="w-full overflow-auto border rounded-md">
            <table className="w-full border-collapse">
              <thead className="bg-muted sticky top-0">
                <tr>
                  {csvData[0].map((header, i) => (
                    <th key={i} className="p-2 text-left border text-sm font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(1).map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                    {row.map((cell, j) => (
                      <td key={j} className="p-2 border text-sm">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      )
    } else if (isDocx && docxContent) {
      return (
        <ScrollArea className="w-full h-[500px]">
          <div className="w-full border rounded-md overflow-auto bg-white p-6">
            <div dangerouslySetInnerHTML={{ __html: docxContent }} />
          </div>
        </ScrollArea>
      )
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] bg-muted/30 rounded-md">
          {getFileIcon()}
          <p className="text-muted-foreground">
            {isImage && imageError 
              ? "Unable to load image preview" 
              : "Preview not available for this file type"}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.open(attachment.url || imageUrl, '_blank')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download to view
          </Button>
        </div>
      )
    }
  }

  const getAcceptTypes = () => {
    if (isImage) return "image/*"
    if (isPdf) return ".pdf,application/pdf"
    if (isCsv) return ".csv,text/csv"
    if (isDocx) return ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return undefined
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>{attachment.name}</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="preview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-4">
            <div className="flex-1 overflow-auto">
              {renderPreview()}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="mt-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">File name</p>
                  <p className="font-medium">{attachment.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">File size</p>
                  <p className="font-medium">{formatFileSize(attachment.size)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded on</p>
                  <p className="font-medium">{format(attachment.uploadedAt, "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">File type</p>
                  <p className="font-medium">{attachment.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded by</p>
                  <p className="font-medium">{attachment.uploadedBy}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleReplace}
          accept={getAcceptTypes()}
        />
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => window.open(attachment.url || pdfUrl, '_blank')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Replace
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}