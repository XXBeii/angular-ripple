import { Directive, HostListener, ElementRef, Renderer2, HostBinding, EventEmitter } from '@angular/core';
import { debounceTime } from 'rxjs/operators';


/**
 * @name 水波纹
 * @see 移动端点击、按压水波纹效果
 * @see 波纹部分样式在app.scss文件中，类名为.ripple和.rippleWrapper
 * @see 若宿主元素position属性为static会被改为relative
 * @example <div ripple></div>
 * @author XXB
 * @version 0.0.1
 */
@Directive({
  selector: '[appRipple]' // Attribute selector
})
export class RippleDirective {
  @HostBinding('style.position') position;
  // 监听click事件
  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent) {
    const ripple = this.el.nativeElement.querySelector('.ripple');
    !ripple && this.rippleFactory();
    this.rippleAnimation({pageX: event.pageX, pageY: event.pageY});
    return
  }
  // 监听按压事件
  @HostListener('press', ['$event'])
  PressEvent(event) {
    let ripple = this.el.nativeElement.querySelector('.ripple');
    !ripple && this.rippleFactory();
    this.rippleAnimation({pageX: event.center.x, pageY: event.center.y});
    return
  }
  private rippleAnimationEvent = new EventEmitter();

  constructor(private el: ElementRef,
  public renderer: Renderer2) {
    // 点击动画消失后移除动画效果
    this.rippleAnimationEvent.pipe(
      debounceTime(750)
    )
    .subscribe(() => {
      renderer.removeClass(el.nativeElement.querySelector('.ripple'), 'show');
      renderer.removeClass(el.nativeElement.querySelector('.rippleWrapper'), 'show');
    })
  }
  /**
   * ripple工厂
   */
  rippleFactory() {
    let target = this.el.nativeElement;
    let rect = target.getBoundingClientRect();
    // 宿主元素是默认定位时，设置为relative
    (window.getComputedStyle(target).position === 'static') && (this.position = 'relative');
    const radius = Math.max(rect.width, rect.height) + 'px';
    // 创建波纹范围
    let rippleWrapper = this.renderer.createElement('div');
    // 添加波纹范围的样式
    this.renderer.addClass(rippleWrapper, 'rippleWrapper');
    // 创建波纹
    let ripple = this.renderer.createElement('span');
    this.renderer.addClass(ripple, 'ripple');
    this.renderer.setStyle(ripple, 'height', radius);
    this.renderer.setStyle(ripple, 'width', radius);
    this.renderer.appendChild(rippleWrapper, ripple);
    this.renderer.appendChild(target, rippleWrapper);
  }
  /**
   * 波纹动画展现
   * @param pageX 触点X坐标
   * @param pageY 触点Y坐标
   */
  rippleAnimation({pageX, pageY}) {
    let target = this.el.nativeElement;
    let rect = target.getBoundingClientRect();
    let ripple = target.querySelector('.ripple');
    let rippleWrapper = target.querySelector('.rippleWrapper');
    // 移除上一次波纹动画动画
    this.renderer.removeClass(rippleWrapper, 'show');
    this.renderer.removeClass(ripple, 'show');
    // 设置新的波纹样式
    let left = pageX - rect.left - ripple.offsetWidth / 2 - document.body.scrollLeft + 'px';
    let top = pageY - rect.top - ripple.offsetHeight / 2 - document.body.scrollTop + 'px';
    this.renderer.setStyle(ripple, 'top', top);
    this.renderer.setStyle(ripple, 'left', left);
    // 新的波纹动画
    this.renderer.addClass(rippleWrapper, 'show');
    this.renderer.addClass(ripple, 'show');
    this.rippleAnimationEvent.emit();
  }


}

