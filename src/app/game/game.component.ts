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
		dimension: 6,
		pieces: [[
			{start: {x: 0, y: 0}, end: {x: 0, y: 1}},
			{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		],
		[
			{start: {x: 0, y: 0}, end: {x: 1, y: 0}},
			{start: {x: 1, y: 0}, end: {x: 1, y: 1}},
			{start: {x: 0, y: 1}, end: {x: 1, y: 1}}
		]]
	}

	subs = new Subscription();
	dragula = 'piece-dragula';

  	constructor(private dragulaService: DragulaService) { 
		this.subs.add(this.dragulaService.drop(this.dragula)
			.subscribe(({ name, el, target, source }) => {
				const left = el.getClientRects()[0].left - target.getClientRects()[0].left
				const top = el.getClientRects()[0].top - target.getClientRects()[0].top
				const piece = this.pieces[Number.parseInt(el.getAttribute("id"))]
				el.setAttribute("style", `left: ${left}px; top: ${top}px; height: ${piece.getHeight()}px; width: ${piece.getWidth()}px`);
			})
		);
		this.subs.add(this.dragulaService.over(this.dragula)
		.subscribe(({ name, el }) => {
			console.log(document.getElementsByClassName("gu-transit").length);
			console.log(document.getElementsByClassName("gu-mirror").length);
			const transitELement = document.getElementsByClassName("gu-transit")[0];
			const mirrorElement = document.getElementsByClassName("gu-mirror")[0]
			console.log(transitELement.getBoundingClientRect());
			transitELement.setAttribute("style", "left: 100px; top: 100px");
		})
	);
	}

  	ngOnInit() {
		Edge.height = (this.getBoardHeight() - (this.gameConfiguration.dimension + 1) * Edge.width) / this.gameConfiguration.dimension;

		this.gameConfiguration.pieces.forEach(pieceConfiguration => {
			const piece = new Piece(pieceConfiguration);
			//todo - make translation for having origin at top left

			this.pieces.push(piece);
		});

		for (let i = 0; i < this.gameConfiguration.dimension; i++) {
			for (let j = 0; j < this.gameConfiguration.dimension; j++) {
				this.blocks.push({
					top: ( i + 1 ) * Edge.width + i * Edge.height,
					left: ( j + 1 ) * Edge.width + j * Edge.height,
					width: Edge.height,
					height: Edge.height
				})
			}
		}
	}

	ngAfterViewInit() {
	
	}

	ngOnDestroy() {
		this.subs.unsubscribe();
	  }

	isMobileView() {
		return typeof window.orientation !== 'undefined'
	}

	getBoardHeight() : number{
		return this.isMobileView() ? screen.width : 600;
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
	static height = 80;

	constructor(top: number, left: number, type: EdgeType) {
		this.top = top;
		this.left = left;
		this.type = type;
	}

	getWidth() {
		return this.type === EdgeType.Vertical ? Edge.width : (Edge.height + Edge.width);
	}

	getHeight() {
		return this.type === EdgeType.Vertical ? (Edge.height + Edge.width) : Edge.width;
	}
}

export enum EdgeType {
	Horizontal = 1,
	Vertical = 2
}

export class Piece {
	edges = Array<Edge>();

	constructor(edgesConfiguration: Array<EdgeConfiguration>) {
		edgesConfiguration.forEach(edgeConfiguration => {
			const horizontal = edgeConfiguration.end.x - edgeConfiguration.start.x;
			const vertical = edgeConfiguration.end.y - edgeConfiguration.start.y;
			if (horizontal !== 1 && vertical === 0 || horizontal === 0 && vertical !== 1) {
				//TODO - 
				alert("Confgiuration is not correct")
			}
			const type = horizontal ? EdgeType.Horizontal : EdgeType.Vertical;
			const left = edgeConfiguration.start.x === 0 ? 0 : (edgeConfiguration.start.x - 1) * Edge.height + Edge.height;
			const top =  edgeConfiguration.start.y === 0 ? 0 : (edgeConfiguration.start.y - 1) * Edge.height + Edge.height;

			this.edges.push(new Edge(top, left, type));
		})
	}

	getWidth() {
		let maxLeft = 0;
		this.edges.forEach(edge => {
			if (edge.left > maxLeft) {
				maxLeft = edge.left;
			}
		});

		return maxLeft + Edge.height + Edge.width;
	}

	getHeight() {
		let maxTop = 0;
		this.edges.forEach(edge => {
			if (edge.top > maxTop) {
				maxTop = edge.left;
			}
		});

		return maxTop + Edge.height + Edge.width;
	}
}

export class Block {
	top: number;
	left: number;
	width: number;
	height: number;
}