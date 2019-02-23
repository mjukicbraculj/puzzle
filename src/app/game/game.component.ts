import { Component, OnInit, ElementRef, AfterViewInit, ViewChildren, QueryList, ViewChild, OnDestroy } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.less']
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {
	pieces = new Array<Piece>();
	blocks = new Array<Block>();

	gameConfiguration = {
		dimension: 4,
		pieces: [[
			{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
			{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		],
		[
			{start: {x: 0, y: 0}, end: {x: 1, y: 0}},
			{start: {x: 1, y: 0}, end: {x: 1, y: 1}},
			{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		],
		[
			{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
			{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		],
		[
			{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
			{start: {x: 0, y: 1}, end: {x: 0, y: 2}},
			{start: {x: 0, y: 2}, end: {x: 0, y: 3}},
			{start: {x: 0, y: 3}, end: {x: 0, y: 4}},
			{start: {x: 0, y: 0}, end: {x: 1, y: 0}},
			{start: {x: 1, y: 0}, end: {x: 2, y: 0}},
			{start: {x: 2, y: 0}, end: {x: 3, y: 0}},
			{start: {x: 3, y: 0}, end: {x: 4, y: 0}}
		]
		// [
		// 	{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
		// 	{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		// ],
		// [
		// 	{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
		// 	{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		// ],
		// [
		// 	{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
		// 	{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		// ],
		// [
		// 	{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
		// 	{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		// ],
		// [
		// 	{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
		// 	{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		// ],
		// [
		// 	{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
		// 	{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		// ],
		// [
		// 	{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
		// 	{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		// ],
		// [
		// 	{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
		// 	{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		// ],
		// [
		// 	{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
		// 	{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		// ]
	]
	}

	subs = new Subscription();
	dragula = 'piece-dragula';
	private mirrorElementClass = 'gu-mirror';

  	constructor(private dragulaService: DragulaService) {
		this.subs.add(this.dragulaService.drop(this.dragula)
			.subscribe(({ name, el, target, source }) => {
				this.dropElementToBoard(el, target)
			})
		);

		this.subs.add(this.dragulaService.cancel(this.dragula)
			.subscribe(({name, el, source}) => {
				if (source.getAttribute('class') === 'board-pieces-container') {
					this.dropElementToBoard(el, source);
				}
			})
		);
	}

  	ngOnInit() {
		// let elem = document.documentElement;
		// let methodToBeInvoked = elem.requestFullscreen;
		// if (methodToBeInvoked) methodToBeInvoked.call(elem);


		Edge.len = (this.getBoardHeight() - (this.gameConfiguration.dimension + 1) * Edge.width) / this.gameConfiguration.dimension;

		this.gameConfiguration.pieces.forEach(pieceConfiguration => {
			const piece = new Piece(pieceConfiguration);
			//todo - make translation for having origin at top left

			this.pieces.push(piece);
		});

		for (let i = 0; i < this.gameConfiguration.dimension; i++) {
			for (let j = 0; j < this.gameConfiguration.dimension; j++) {
				this.blocks.push({
					top: ( i + 1 ) * Edge.width + i * Edge.len,
					left: ( j + 1 ) * Edge.width + j * Edge.len,
					width: Edge.len,
					height: Edge.len
				})
			}
		}
	}

	ngAfterViewInit() {

	}

	ngOnDestroy() {
		this.subs.unsubscribe();
	  }

	isMobileView() : boolean{
		return typeof window.orientation !== 'undefined'
	}

	getBoardHeight() : number{
		return this.isMobileView() ? screen.width - 40 : 600;
	}

	getPiecesContainerHeight() : number {
		return this.isMobileView() ? screen.height - screen.width : this.getBoardHeight(); //todo margin top bottom
	}

	private dropElementToBoard(element: Element, target: Element) : void{
		const piece = this.pieces[Number.parseInt(element.getAttribute("id"))]

		const mirrorElement = document.getElementsByClassName(this.mirrorElementClass)[0];
		const mirrorElementClientRect = mirrorElement.getClientRects()[0];
		const targetClientRect = target.getClientRects()[0];
		const top = mirrorElementClientRect.top - targetClientRect.top;
		const left = mirrorElementClientRect.left - targetClientRect.left;

		element.setAttribute("style", `left: ${left}px; top: ${top}px; height: ${piece.getHeight()}px; width: ${piece.getWidth()}px`);
	}
}

export class VertexConfiguration {
	x: number;
	y: number;
}

export class EdgeConfiguration {
	start: VertexConfiguration;
	end: VertexConfiguration;
}

export class Edge {
	top: number;
	left: number;
	type: EdgeType
	static width = 30;
	static len = 80;

	constructor(top: number, left: number, type: EdgeType) {
		this.top = top;
		this.left = left;
		this.type = type;
	}

	getWidth() {
		return this.type === EdgeType.Vertical ? Edge.width : (Edge.len + Edge.width * 2);
	}

	getHeight() {
		return this.type === EdgeType.Vertical ? (Edge.len + Edge.width * 2) : Edge.width;
	}
}

export enum EdgeType {
	Horizontal = 1,
	Vertical = 2
}

export class Piece {
	edges = Array<Edge>();
	minX = null;
	maxX = null;
	minY = null;
	maxY = null;

	constructor(edgesConfiguration: Array<EdgeConfiguration>) {
		edgesConfiguration.forEach(edgeConfiguration => {
			const horizontal = edgeConfiguration.end.x - edgeConfiguration.start.x;
			const vertical = edgeConfiguration.end.y - edgeConfiguration.start.y;
			if (horizontal !== 1 && vertical === 0 || horizontal === 0 && vertical !== 1) {
				//TODO -
				alert("Confgiuration is not correct")
			}
			const type = horizontal ? EdgeType.Horizontal : EdgeType.Vertical;
			const left = edgeConfiguration.start.x === 0 ? 0 : (edgeConfiguration.start.x - 1) * (Edge.len + Edge.width) + Edge.len + Edge.width;
			const top =  edgeConfiguration.start.y === 0 ? 0 : (edgeConfiguration.start.y - 1) * (Edge.len + Edge.width) + Edge.len + Edge.width;

			if (this.minX === null || this.minX > edgeConfiguration.start.x) {
				this.minX = edgeConfiguration.start.x;
			}
			if (this.maxX === null || this.maxX < edgeConfiguration.end.x) {
				this.maxX = edgeConfiguration.end.x;
			}

			if (this.minY === null || this.minY > edgeConfiguration.start.y) {
				this.minY = edgeConfiguration.start.y;
			}
			if (this.maxY === null || this.maxY < edgeConfiguration.end.y) {
				this.maxY = edgeConfiguration.end.y;
			}
			
			this.edges.push(new Edge(top, left, type));
		})
	}

	getWidth() {
		return Math.abs(this.maxX - this.minX) * (Edge.len + Edge.width) + Edge.width;
	}

	getHeight() {
		return Math.abs(this.maxY - this.minY) * (Edge.len + Edge.width) + Edge.width;
	}
}

export class Block {
	top: number;
	left: number;
	width: number;
	height: number;
}