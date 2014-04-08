var ChartHandler = function(){
    var _self = this;

    _self.usingMegabytes = false;

    _self.fn = {
        getDataAndLabels: function(){
            var usage = dataModel.memory();
            var dataset = [];
            var labels = [];
            for(var i = 0, ii = usage.length; i < ii; i++){
                var date = new Date(parseInt(usage[i].time));
                var hours = date.getHours();
                if(hours < 10) hours = "0"+hours;
                var minutes = date.getMinutes();
                if(minutes < 10) minutes = "0" + minutes;
                labels.push("       "+hours + ":" + minutes);
                if(_self.usingMegabytes){
                    dataset.push(((parseInt(usage[i].memory.split(":")[0])/1024/1024)).toFixed(2));
                }else{
                    var value = (parseInt(usage[i].memory.split(":")[0])/1024);
                    if(value > 1024){
                        _self.usingMegabytes = true;
                        value /= 1024;
                    }
                    dataset.push((value).toFixed(2));
                }
            }
            return {data: dataset, labels: labels};
        },
        getOptions: function(data){
            var min = Math.max.apply(Math, data);
            var max = Math.min.apply(Math, data);

            var options = {};

            var scaleLabel = "<%=value%> " + (_self.usingMegabytes ? "MB" : "KB");

            if (max == min) {
                //Chart.js screws up if all the data on a line is the same, this is a workaround.
                options = {
                    animation: false,
                    scaleOverride: true,
                    scaleSteps: 3,
                    scaleStepWidth: 1,
                    scaleStartValue: max-2,
                    scaleLabel: scaleLabel
                };
            }else{
                options = {
                    animation: false,
                    scaleLabel: scaleLabel
                };
            }
            _self.usingMegabytes = false;
            return options;
        },
        subscribe: function(){
            var ctx = $("#memoryChart").get(0).getContext("2d");
            dataModel.memory.subscribe(function(){
                ctx.canvas.width = 350;
                ctx.canvas.height = 200;
                var info = _self.fn.getDataAndLabels();

                var data = {
                    labels : info.labels,
                    datasets : [
                        {
                            fillColor : "rgba(151,187,205,0.5)",
                            strokeColor : "rgba(151,187,205,1)",
                            pointColor : "rgba(151,187,205,1)",
                            pointStrokeColor : "#fff",
                            data : info.data
                        }
                    ]
                };
                new Chart(ctx).Line(data, _self.fn.getOptions(info.data));
            });
        }
    };

    return _self;
}

var chartHandler = new ChartHandler();


$(document).ready(function(){
    chartHandler.fn.subscribe();
});