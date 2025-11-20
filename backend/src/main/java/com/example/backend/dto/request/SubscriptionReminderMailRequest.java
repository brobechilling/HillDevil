package com.example.backend.dto.request;

public class SubscriptionReminderMailRequest {
    private String mail;         // email người nhận
    private String name;         // tên người nhận
    private String packageName;  // tên gói subscription
    private String endDate;      // ngày hết hạn
    private String renewLink;
    
    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getRenewLink() {
        return renewLink;
    }

    public void setRenewLink(String renewLink) {
        this.renewLink = renewLink;
    }
}
