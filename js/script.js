const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928']

// Part 1: Создать шкалы для цвета, радиуса и позиции 
const radius = d3.scaleLinear()
radius.range([.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append("g")
        .attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")");

const donut_lable = d3.select('.donut-chart').append('text')
        .attr('class', 'donut-lable')
        .attr("text-anchor", "middle")
        .attr('transform', `translate(${(d_width/2)} ${d_height/2})`);
const tooltip = d3.select('.tooltip');

//  Part 1 - Создать симуляцию с использованием forceCenter(), forceX() и forceCollide()
const simulation = d3.forceSimulation()


d3.csv('data/netflix.csv').then(data=>{
    data = d3.nest().key(d=>d.title).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['user rating score']!=='NA');
    console.log(data)
    
    const rating = data.map(d=>+d['user rating score']);
    const years = data.map(d=>+d['release year']);
    let ratings = d3.nest().key(d=>d.rating).rollup(d=>d.length).entries(data);
    
    
    // Part 1 - задать domain  для шкал цвета, радиуса и положения по x
    radius.domain([d3.min(rating), d3.max(rating)]);
    x.domain([d3.min(years), d3.max(years)]);

    
    // Part 1 - создать circles на основе data
    var nodes = bubble
        .selectAll("circle")
        .data(data).enter().append("circle")
        .on('mouseover', overBubble)
        .on('mouseout', outOfBubble);

    
    // Part 1 - передать данные в симуляцию и добавить обработчик события tick
    simulation.nodes(data)
        .force("center", d3.forceCenter(b_width/2,b_height/2))
        .force("x", d3.forceX().x(d=>x(+d['release year'])))
        .force("collide", d3.forceCollide().radius(d=>radius(+d['user rating score'])))
        .on("tick", ftick)
    function ftick(){
        nodes.enter()
            .append("circle")
            .merge(nodes)
            .attr("fill", d=>color(d['rating']))
            .attr("r", d=>radius(+d['user rating score']))
            .attr("cx", d=>d.x)
            .attr("cy", d=>d.y)
            .attr("class", d=>d['rating'])
            .exit().remove();
    }

    // Part 1 - Создать шаблон при помощи d3.pie() на основе ratings
    var pie = d3.pie()
        .value(d=>d.value);
    
    // Part 1 - Создать генератор арок при помощи d3.arc()
    donut.selectAll('path')
        .data(pie(ratings))
        .enter().append('path')
        .attr('d', d3.arc()
            .innerRadius(75)
            .outerRadius(200))
        .attr('fill', d=>color(d.data.key))
        .attr("stroke", "white")
        .style("stroke-width", "3px")
        .style("opacity", "0.9")

    // добавляем обработчики событий mouseover и mouseout
        .on('mouseover', overArc)
        .on('mouseout', outOfArc);

    function overBubble(d){
        console.log(d)
        // Part 2 - задать stroke и stroke-width для выделяемого элемента   
        d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", "1px")
        
        // Part 3 - обновить содержимое tooltip с использованием классов title и year
        tooltip.html(d['title']+'<br> <font size=\'2\' color=\"808080\">'+d['release year']+'</font>')
            .style("left", (d3.mouse(this)[0] + 40) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
        // Part 3 - изменить display и позицию tooltip
        tooltip.style('display', 'block')
    }
    function outOfBubble(){
        // Part 2 - сбросить stroke и stroke-width
        d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", "1")
            
        // Part 3 - изменить display у tooltip
        tooltip.style('display', 'none')
    }

    function overArc(d){
        console.log(d)
        // Part 2 - изменить содержимое donut_lable
        donut_lable.text(d.data.key)
        // Part 2 - изменить opacity арки
        d3.select(this)
            .style("opacity", "0.2")

        // Part 3 - изменить opacity, stroke и stroke-width для circles в зависимости от rating
        d3.selectAll("circle")
            .style("opacity", "0.2")
        d3.selectAll('.'+d.data.key)
            .style('opacity', '0.8')
            .style("stroke", "black")
            .style("stroke-width", "2px")
    }
    function outOfArc(){
        // Part 2 - изменить содержимое donut_lable
        donut_lable.text('')
        // Part 2 - изменить opacity арки
        d3.select(this)
            .style("opacity", "0.8")

        // Part 3 - вернуть opacity, stroke и stroke-width для circles
        d3.selectAll('circle')
            .style('opacity', '0.7')
            .style("stroke", "black")
            .style("stroke-width", "1")
    }
});