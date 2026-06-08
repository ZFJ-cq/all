package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.Mail;
import com.lingyue.entity.MailItem;
import com.lingyue.repository.MailRepository;
import com.lingyue.repository.MailItemRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/mail")
public class MailController {
    
    private final MailRepository mailRepository;
    private final MailItemRepository mailItemRepository;
    
    public MailController(MailRepository mailRepository, MailItemRepository mailItemRepository) {
        this.mailRepository = mailRepository;
        this.mailItemRepository = mailItemRepository;
    }
    
    // 根据用户ID获取邮件
    @GetMapping("/user/{userId}")
    public List<Mail> getMailsByUserId(@PathVariable Long userId) {
        return mailRepository.findByUserId(userId);
    }
    
    // 获取邮件详情
    @GetMapping("/{mailId}")
    public Mail getMailById(@PathVariable Long mailId) {
        return mailRepository.findById(mailId).orElse(null);
    }
    
    // 获取邮件附件
    @GetMapping("/{mailId}/items")
    public List<MailItem> getMailItems(@PathVariable Long mailId) {
        return mailItemRepository.findByMailId(mailId);
    }
    
    // 标记邮件为已读
    @PutMapping("/{mailId}/read")
    public Mail markMailAsRead(@PathVariable Long mailId) {
        Mail mail = mailRepository.findById(mailId).orElse(null);
        if (mail != null) {
            mail.setIsRead(1);
            return mailRepository.save(mail);
        }
        return null;
    }
    
    // 删除邮件
    @DeleteMapping("/{mailId}")
    public void deleteMail(@PathVariable Long mailId) {
        mailRepository.deleteById(mailId);
    }
    
    // 发送邮件
    @PostMapping
    public Mail sendMail(@RequestBody Mail mail) {
        return mailRepository.save(mail);
    }
    
    // 批量发送邮件
    @PostMapping("/batch")
    public List<Mail> batchSendMails(@RequestBody List<Mail> mails) {
        return mailRepository.saveAll(mails);
    }
    
    // 获取未读邮件数量
    @GetMapping("/unread/count/{userId}")
    public long getUnreadMailCount(@PathVariable Long userId) {
        return mailRepository.countByUserIdAndIsRead(userId, 0);
    }
}