import { Directive } from '@angular/core';
import { ElementRef } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { NgZone } from '@angular/core';

export interface TextSelectEvent {
    text: string;
    viewportRectangle: SelectionRectangle | null;
    hostRectangle: SelectionRectangle | null;
}

interface SelectionRectangle {
    left: number;
    top: number;
    width: number;
    height: number;
}

@Directive({
    selector: '[textSelect]',
    outputs: [ 'textSelectEvent: textSelect' ]
})
export class TextSelectDirective implements OnInit, OnDestroy {
    public textSelectEvent: EventEmitter<TextSelectEvent>;
    private elementRef: ElementRef;
    private hasSelection: boolean;
    private zone: NgZone;

    constructor(
        elementRef: ElementRef,
        zone: NgZone
        ) {
        this.elementRef = elementRef;
        this.zone = zone;
        this.hasSelection = false;
        this.textSelectEvent = new EventEmitter();

    }

    public ngOnDestroy(): void {
        this.elementRef.nativeElement.removeEventListener( 'mousedown', this.handleMousedown, false );
        document.removeEventListener( 'mouseup', this.handleMouseup, false );
        document.removeEventListener( 'selectionchange', this.handleSelectionchange, false );
    }

    public ngOnInit(): void {
        this.zone.runOutsideAngular(
            () => {
                this.elementRef.nativeElement.addEventListener( 'mousedown', this.handleMousedown, false );
                document.addEventListener( 'selectionchange', this.handleSelectionchange, false );
            }
        );
    }

    private getRangeContainer( range: Range ): Node {
        let container = range.commonAncestorContainer;
        while ( container.nodeType !== Node.ELEMENT_NODE ) {
            container = container.parentNode;
        }
        return( container );
    }

    private handleMousedown = (): void => {
        document.addEventListener( 'mouseup', this.handleMouseup, false );
    }

    private handleMouseup = (): void => {
        document.removeEventListener( 'mouseup', this.handleMouseup, false );
        this.processSelection();
    }

    private handleSelectionchange = (): void => {
        if ( this.hasSelection ) {
            this.processSelection();
        }
    }

    private isRangeFullyContained( range: Range ): boolean {
        const hostElement = this.elementRef.nativeElement;
        let selectionContainer = range.commonAncestorContainer;
        while ( selectionContainer.nodeType !== Node.ELEMENT_NODE ) {
            selectionContainer = selectionContainer.parentNode;
        }
        return( hostElement.contains( selectionContainer) );
    }

    private processSelection(): void {
        const selection = document.getSelection();
        if ( this.hasSelection ) {
            this.zone.runGuarded(
                () => {

                    this.hasSelection = false;
                    this.textSelectEvent.next({
                        text: '',
                        viewportRectangle: null,
                        hostRectangle: null,
                    });

                }
            );

        }

        if ( ! selection.rangeCount || ! selection.toString() ) {
            return;
        }
        const range = selection.getRangeAt( 0 );
        const rangeContainer = this.getRangeContainer( range );
        if ( this.elementRef.nativeElement.contains( rangeContainer ) ) {
            const viewportRectangle = range.getBoundingClientRect();
            const localRectangle = this.viewportToHost( viewportRectangle, rangeContainer );
            this.zone.runGuarded(
                () => {

                    this.hasSelection = true;
                    this.textSelectEvent.emit({
                        text: selection.toString(),
                        viewportRectangle: {
                            left: viewportRectangle.left,
                            top: viewportRectangle.top,
                            width: viewportRectangle.width,
                            height: viewportRectangle.height
                        },
                        hostRectangle: {
                            left: localRectangle.left,
                            top: localRectangle.top,
                            width: localRectangle.width,
                            height: localRectangle.height
                        }
                    });

                }
            );

        }

    }

    private viewportToHost(
        viewportRectangle: SelectionRectangle,
        rangeContainer: Node
        ): SelectionRectangle {

        const host = this.elementRef.nativeElement;
        const hostRectangle = host.getBoundingClientRect();
        let localLeft = ( viewportRectangle.left - hostRectangle.left );
        let localTop = ( viewportRectangle.top - hostRectangle.top );

        let node = rangeContainer;
        do {

            localLeft += ( <Element>node ).scrollLeft;
            localTop += ( <Element>node ).scrollTop;

        } while ( ( node !== host ) && ( node = node.parentNode ) );

        return({
            left: localLeft,
            top: localTop,
            width: viewportRectangle.width,
            height: viewportRectangle.height
        });

    }

}
