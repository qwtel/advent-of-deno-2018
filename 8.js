const fs = require('fs').promises;

(async () => {
    // let input = `2 3 0 3 10 11 12 1 1 0 1 99 2 1 1 2`;

    input = (await fs.readFile('8.txt', 'utf8')).trim();

    const treeInput = input.split(' ').map(Number);

    // 1
    {
        function walkTree(t) {
            const [a, b] = [t.shift(), t.shift()];
            let num = 0;
            for (let i = 0; i < a; i++) num += walkTree(t);
            for (let j = 0; j < b; j++) num += t.shift();
            return num;
        }

        console.log(walkTree([...treeInput]));
    }

    // 2
    {
        function buildTree(t, c = 0) {
            const letter = String.fromCharCode(c + 65);
            const children = [];
            const meta = [];
            const [a, b] = [t.shift(), t.shift()];
            for (let i = 0; i < a; i++) children.push(buildTree(t, ++c));
            for (let j = 0; j < b; j++) meta.push(t.shift());
            return { letter, children, meta };
        }

        const add = (a, b) => a + b;

        function countStuff({ children, meta }) {
            if (!children.length) return meta.reduce(add, 0);
            return meta
                .map(i => children[i - 1])
                .filter(x => x)
                .map(c => countStuff(c))
                .reduce(add, 0);
        }

        const tree = buildTree([...treeInput]);
        // console.log(tree);
        console.log(countStuff(tree));
    }

})();
