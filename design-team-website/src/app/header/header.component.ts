import { Component } from "@angular/core";

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})

export class AppComponentHeader{
    menuValue:boolean= false;
    menu_icon:string="bi bi-list"

    toggleMenu(){
        this.menuValue = !this.menuValue
        this.menu_icon = this.menuValue ? "bi bi-x" : "bi bi-list";
    }

    closeMenu(){
        this.menuValue = false
        this.menu_icon = "bi bi-list"
    }
}