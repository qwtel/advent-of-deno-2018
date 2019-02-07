export class Array2D {
    constructor(bounds = [[0, 0], [1, 1]], defaultValue = 0) {
        const [[minX, minY], [maxX, maxY]] = this._bounds = bounds;
        const [diffX, diffY] = [maxX - minX, maxY - minY];
        this._array = new Array(diffX).fill(defaultValue).map(() => new Array(diffY).fill(defaultValue));
        this._coordToIndex = ([x, y]) => [x - minX, y - minY];
    }

    static of(arr2D, bounds = [[0, 0], [arr2D.length, arr2D[0].length]]) {
        const a = new Array2D(bounds);
        for (const p of a.coords()) {
            const [ix, iy] = a._coordToIndex(p)
            a.set(p, arr2D[ix][iy])
        }
        return a;
    }

    clone() {
        const a = new Array2D();
        a._array = this._array.map(row => [...row]);
        a._bounds = this._bounds.map(([x, y]) => [x, y]);
        return a;
    }

    *[Symbol.iterator]() {
        for (const row of this._array)
            for (const cell of row)
                yield cell;
    }

    forEach(f) {
        for (const x of this) f(x);
    }

    map(f) {
        const a = new Array2D();
        a._array = this._array.map(row => row.map(f));
        a._bounds = this._bounds.map(([x, y]) => [x, y]);
        return a;
    }

    set(point, value) {
        const [x, y] = this._coordToIndex(point);
        this._array[x][y] = value;
        return this;
    }

    get(point) {
        const [x, y] = this._coordToIndex(point);
        return this._array[x][y];
    }

    get size() {
        return this._array.length * this._array[0].length;
    }

    get sizeX() {
        return this._array.length;
    }

    get sizeY() {
        return this._array[0].length;
    }

    get bounds() {
        return this._bounds.map(([x, y]) => [x, y]);
    }

    transpose() {
        const a = new Array2D();
        a._array = this._array[0].map((_, i) => this._array.map(x => x[i]));
        a._bounds = this._bounds.map(([x, y]) => [y, x]);
        return a;
    }

    // TODO: this is probably not doing what you'd expect
    *rows() {
        for (const row of this.clone()._array) yield row;
    }

    // TODO: this is probably not doing what you'd expect
    *columns() {
        for (const col of this.transpose()._array) yield col;
    }

    *coords() {
        const [[minX, minY], [maxX, maxY]] = this._bounds;
        for (let x = minX; x < maxX; x++)
            for (let y = minY; y < maxY; y++)
                yield [x, y];
    }

    *values() {
        for (const p of this.coords()) yield this.get(p);
    }

    *entries() {
        for (const p of this.coords()) yield [p, this.get(p)];
    }

    // delivers all the edge coordinates in clockwise fashion
    // including min, excluding max
    *edgeCoords() {
        const [[minX, minY], [maxX, maxY]] = this._bounds;
        for (let x = minX; x < maxX; x++) yield [x, minY];
        for (let y = minY + 1; y < maxY; y++) yield [maxX - 1, y];
        for (let x = maxX - 2; x >= minX; x--) yield [x, maxY - 1];
        for (let y = maxY - 2; y >= minY + 1; y--) yield [minX, y];
    }

    *edgeValues() {
        for (const p of this.edgeCoords()) yield this.get(p);
    }

    *edgeEntries() {
        for (const p of this.edgeCoords()) yield [p, this.get(p)];
    }

    isInside([x, y]) {
        const [[minX, minY], [maxX, maxY]] = this._bounds;
        return x >= minX && x < maxX && y >= minY && y < maxY;
    }

    isOutside([x, y]) {
        const [[minX, minY], [maxX, maxY]] = this._bounds;
        return x < minX || x >= maxX || y < minY || y >= maxY;
    }
}