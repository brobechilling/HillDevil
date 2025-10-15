package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaFallbackController {
    @RequestMapping(value = {
        "/{path:[^\\.]*}",
        "/**/{path:[^\\.]*}"
    })
    public String redirect() {
        return "forward:/index.html";
    }
}