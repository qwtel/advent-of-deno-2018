export class Array2D {
    static of(arr2D, bounds = [[0, 0], [arr2D[0].length, arr2D.length]]) {
        const a = new Array2D(bounds);
        for (const p of a.coords()) {
            const [ix, iy] = a._coordToIndex(p);
            a.set(p, arr2D[iy][ix]);
        }
        return a;
    }

    constructor(bounds = [[0, 0], [1, 1]], defaultValue = 0) {
        const [[minX, minY], [maxX, maxY]] = this._bounds = bounds;
        const [diffX, diffY] = [maxX - minX, maxY - minY];
        this._array = new Array(diffY).fill(defaultValue).map(() => new Array(diffX).fill(defaultValue));
    }

    _coordToIndex([x, y]) {
        const [[minX, minY]] = this.bounds;
        return [x - minX, y - minY];
    }

    _indexToCoord(i, j) {
        const [[minX, minY]] = this.bounds;
        return [i + minX, j + minY];
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
        a._array = this._array.forEach((row, iy) =>
            row.forEach((x, ix) =>
                f(x, this._indexToCoord(ix, iy), this)));
    }

    map(f) {
        const a = new Array2D();
        a._array = this._array.map((row, iy) =>
            row.map((c, ix) =>
                f(c, this._indexToCoord(ix, iy), this)));
        a._bounds = this._bounds.map(([x, y]) => [x, y]);
        return a;
    }

    set(point, value) {
        const [ix, iy] = this._coordToIndex(point);
        this._array[iy][ix] = value;
        return this;
    }

    get(point) {
        const [ix, iy] = this._coordToIndex(point);
        if (this.isOutside(point)) return undefined;
        return this._array[iy][ix];
    }

    get size() {
        return this._array.length * this._array[0].length;
    }

    get sizeX() {
        return this._array[0].length;
    }

    get sizeY() {
        return this._array.length;
    }

    get bounds() {
        return this._bounds.map(([x, y]) => [x, y]);
    }

    transpose() {
        const a = new Array2D();
        a._array = this._array[0].map((_, i) => this._array.map(r => r[i]));
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

    toString() {
        let s = ''
        for (const r of this.rows()) s += r.join('') + '\n';
        return s;
    }
}