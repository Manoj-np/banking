package com.example.banking.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller to handle SPA (Single Page Application) routing.
 * Redirects all non-API and non-static-file paths to index.html
 * so that React Router can handle the routing.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
        "/{path:[^\\.]*}",
        "/*/{path:[^\\.]*}",
        "/*/*/{path:[^\\.]*}"
    })
    public String redirect() {
        return "forward:/index.html";
    }
}
