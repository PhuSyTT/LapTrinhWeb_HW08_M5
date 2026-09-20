package vn.iotstar.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import vn.iotstar.service.IStorageService;

@Controller
public class ImageUploadController {

    @Autowired
    private IStorageService storageService;

    @GetMapping("/admin/categories/images/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveCategoryFile(@PathVariable String filename) {
        return serveFile(filename);
    }

    @GetMapping("/admin/products/images/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveProductFile(@PathVariable String filename) {
        return serveFile(filename);
    }

    @GetMapping("/uploads/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveUploadFile(@PathVariable String filename) {
        return serveFile(filename);
    }

    @org.springframework.web.bind.annotation.PostMapping("/admin/upload/image")
    @ResponseBody
    public ResponseEntity<?> uploadImage(@org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            if (file != null && !file.isEmpty()) {
                java.util.UUID uuid = java.util.UUID.randomUUID();
                String filename = storageService.getSorageFilename(file, uuid.toString());
                storageService.store(file, filename);
                java.util.Map<String, String> result = new java.util.HashMap<>();
                result.put("filename", filename);
                return ResponseEntity.ok(result);
            }
            return ResponseEntity.badRequest().body("File is empty");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }


    private ResponseEntity<Resource> serveFile(String filename) {
        try {
            Resource file = storageService.loadAsResource(filename);
            String contentType = "image/png";
            if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (filename.toLowerCase().endsWith(".gif")) {
                contentType = "image/gif";
            } else if (filename.toLowerCase().endsWith(".webp")) {
                contentType = "image/webp";
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(file);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
