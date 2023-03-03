//插件js
(function () {

    let dragActId = [];//要拖拽的备选项id数组
    let dragActInCellId = "";//要拖拽的单元格内的备选项id
    let dragActAttribute = {};//拖拽后备选的属性信息
    let keyCtrl = false;//按住ctrl键

    let interface = [];//接口
    let actions = {};
    actions["print"]={"text":"打印","num":3,"color":"#A0522D"}
    actions["import"]={"text":"导入","num":2,"color":"#6495ed"}
    actions["export"]={"text":"导出","num":4,"color":"#8A2BE2"}
    actions["interface"]={"text":"界面","num":1,"color":"#FFA500"}
    actions["sheet"]={"text":"表","num":0,"color":"#8FBC8F"}

    interface.push(
        {
            "col":1,
            "row":2,
            "actions":[
                {
                    "type":"print",
                    "num":2
                },
                {
                    "type":"import",
                    "num":1
                }
            ]
        },
        {
            "col":2,
            "row":3,
            "actions":[
                {
                    "type":"interface",
                    "num":1
                },
                {
                    "type":"import",
                    "num":1
                }
            ]
        },
        {
            "col":2,
            "row":2,
            "actions":[
                {
                    "type":"print",
                    "num":1
                }
            ]
        }
    )

    var _options = {
        target: "",
        plugin_htmlId:""
    }

    var _plugin_api = {
        init: function (options) {
            _options.target = options.target;
            _options.plugin_htmlId = options.plugin_htmlId;
            console.log("插件初始化参数：",options);
            console.log("插件初始化完成");

            $("#"+_options.target).find("table").addClass("plugin_table");

            console.log("插件：",this);

            this.showActions();//生成备选
            this.dragByInterface();//根据接口生成

            this.dropAction();//单元格drop事件
            this.dragAction();//备选对象的拖拽 及拖入单元格中的备选项的拖拽

            this.bindAction();//其他事件
            
        },
        //绑定事件
        bindAction:function(){
            //单元格中的备选项选中
            $("#"+_options.target).find("tbody").on("mouseup",".act",function(e){
                if(e.button == 0){
                    if($(this).hasClass("actSel")) $(this).removeClass("actSel");
                    else $(this).addClass("actSel");
                }
                if(e.button == 2) {
                    $(this).bind("contextmenu", false); //禁用冒泡
                    
                    $("#contextmenu").css("top",e.pageY);
                    $("#contextmenu").css("left",e.pageX);
                    $("#contextmenu").find("input[name='menuObjId']").val($(this).attr("id"));
                    $("#contextmenu").find(".edit").show();
                    $("#contextmenu").find(".filter").hide();
                    $("#contextmenu").find(".filterClear").hide();
                }
            })

            //单元格中的备选项删除
            $(document).keydown(function(e){
                if(e.originalEvent.code=="Delete"){
                    if($("#"+_options.target).find("tbody").find(".actSel").length>0){
                        let id = $("#"+_options.target).find("tbody").find(".actSel").attr("id");
                        id = id.split("_")[0];
                        let markNum = parseInt($("#"+_options.plugin_htmlId).find("#"+id).find(".mark").text());
                        markNum = markNum + 1;
                        $("#"+_options.plugin_htmlId).find("#"+id).find(".mark").text(markNum);
        
                        //可放置
                        markNum = parseInt($("#"+_options.target).find("tbody").find(".actSel").parent().find(".mark").text());
                        if(!isNaN(markNum)) {
                            markNum = markNum + 1;
                            $("#"+_options.target).find("tbody").find(".actSel").parent().find(".mark").text(markNum);
                        }
        
                        $("#"+_options.target).find("tbody").find(".actSel").remove();
                    }
                }
                if(e.originalEvent.key=="Control"){
                    keyCtrl = true;
                }
            })
            $(document).keyup(function(e){
                keyCtrl = false;
            });
        },
        //生成uniId
        getUniqueId:function(){
            let id = new Date().getTime();
            id = id + Math.floor(Math.random() * 9000 + 1000);
            return id
        },
        //根据接口数据生成备选项
        showActions:function(){
            let htmlStr = "<div class=\"plugin_actions\">";
            for(key in actions){
                htmlStr = htmlStr + '<div style="background-color:'+actions[key].color+'" class="act" id="'+key+'" draggable="true">'+actions[key].text+'<span class="mark">'+actions[key].num+'</span></div>';
            }
            htmlStr = htmlStr + "</div>";
            $("#"+_options.plugin_htmlId).append(htmlStr);
        },
        //返回拖拽对象的文本
        getActText(type){
            return actions[type].text;
        },
        //返回拖拽对象的的颜色
        getActColor(type){
            return actions[type].color;
        },
        //单元格过滤不显示的备选项
        filterAct(obj){
            let notshow = obj.data("notshow");
            if(notshow==undefined) return false;

            obj.find(".act").each(function(){
                let id = $(this).attr("id");
                id = id.split("_")[0];
                if(notshow.indexOf(id)>-1){
                    $(this).hide();
                }
            })
        },
        //根据接口自动填充
        dragByInterface(){
            for(let i=0;i<interface.length;i++){
                let col = interface[i].col;
                let row = interface[i].row;
                let actions = interface[i].actions;
                let tdObj = $("#"+_options.target).find("tbody").find("tr").eq(row-1).find("td").eq(col-1);
                for(let j=0;j<actions.length;j++){
                    let type = actions[j].type;
                    let num = actions[j].num;

                    for(let k=0;k<num;k++){
                        let id = type+'_'+this.getUniqueId();
                        let text = this.getActText(type);
                        let color = this.getActColor(type);

                        //可以拖拽数
                        let canDragNum = parseInt($("#"+type).find(".mark").text());
                        canDragNum = canDragNum-1;
                        $("#"+type).find(".mark").text(canDragNum);

                        //可以放置数
                        let canDropNum = parseInt(tdObj.find(".mark").text());
                        if(canDropNum>0){
                            canDropNum = canDropNum -1;
                            tdObj.find(".mark").text(canDropNum);
                        }

                        tdObj.append('<div draggable="true" class="act" style="background-color:'+color+';" id="'+id+'">'+text+'</div>');
                        dragActAttribute[id]={"attribute":""};
                    }
                }
                //filterAct(tdObj);//过滤
                //tdObj.attr("_e","2");
            }
        },
        dropAction:function(){
            _this = this;
            $("#"+_options.target).find("tbody").find("tr").on("dragover","td",function(e){
                e.preventDefault();
            })

            $("#"+_options.target).find("tbody").find("tr").on("drop","td",function(e){

                //tr未设置candrop=0表示可以drop
                //td未设置candrop=0表示可以drop
                let candrop = false;
                let td_candrop = $(this).data("candrop");
                let tr_candrop = $(this).parent().data("candrop");
                if(td_candrop=="1") candrop = true;
                else{
                    if(td_candrop=="0") candrop = false;
                    else{
                        if(tr_candrop=="0") candrop = false;
                        else candrop = true;
                    }
                }
                
                if(candrop){//单元格允许放下
                   
                    if(dragActId.length>0){//备选项拖入

                        let text = '';

                        for(let i=0;i<dragActId.length;i++){
                            let dragActIdTmp = dragActId[i];
                            text = _this.getActText(dragActIdTmp);
                            color = _this.getActColor(dragActIdTmp);

                            //备选项的数量控制
                            let canDragNum = parseInt($("#"+dragActIdTmp).find(".mark").text());
                            if(canDragNum==0) break;//禁止拖拽了

                            //允许放置备选项数量控制
                            let canDropNum = parseInt($(this).find(".mark").text());
                            if(canDropNum==0) break;//放不下了

                            //放置备选项
                            canDragNum = canDragNum - 1;
                            $("#"+dragActIdTmp).find(".mark").text(canDragNum);
                            canDropNum = canDropNum - 1;
                            $(this).find(".mark").text(canDropNum);

                            let id = dragActIdTmp+'_'+_this.getUniqueId();
                            $(this).append('<div draggable="true" class="act" style="background-color:'+color+';" id="'+id+'">'+text+'</div>');
                            dragActAttribute[id]={"attribute":""}; 
                        }

                        if($(this).find(".act").length!=dragActId.length) $(this).attr("_e","1");
                        else $(this).attr("_e","2");

                        //清理备选项选中
                        $(".actions").find(".actSel").removeClass("actSel");
                        dragActId = [];
                    }

                    if(dragActInCellId!=""){//已在单元格的备选项拖入
                            
                        if($("#"+dragActInCellId).parent().is($(this))) return false;//当前单元格
                        else{

                            if(keyCtrl){//复制流程

                                //允许放置备选项数量控制
                                let canDropNum = parseInt($(this).find(".mark").text());
                                if(canDropNum==0) return false;//放不下了

                                //总备选项数量控制
                                let objType = dragActInCellId.split("_")[0];
                                let canDragNum = parseInt($("#"+objType).find(".mark").text());
                                if(canDragNum==0) return false;//不能拽了

                                //放置备选项
                                canDropNum = canDropNum - 1;
                                $(this).find(".mark").text(canDropNum);

                                //总备选项数量变更
                                canDragNum = canDragNum - 1;
                                $("#"+objType).find(".mark").text(canDragNum);

                                let id = objType+'_'+_this.getUniqueId();
                                let text = _this.getActText(objType);
                                let color = _this.getActColor(objType);

                                $(this).append('<div draggable="true" class="act" style="background-color:'+color+';" id="'+id+'">'+text+'</div>');
                                dragActAttribute[id]={"attribute":dragActAttribute[dragActInCellId]["attribute"]};

                                $(this).attr("_e","1");
                            }
                            else{//非复制流程

                                //允许放置备选项数量控制
                                let canDropNum = parseInt($(this).find(".mark").text());
                                if(canDropNum==0) return false;//放不下了

                                //放置备选项
                                canDropNum = canDropNum - 1;
                                $(this).find(".mark").text(canDropNum);

                                //原单元格数量变更
                                let oldTdObj = $("#"+dragActInCellId).parent();
                                canDropNum =oldTdObj.find(".mark").text();
                                if(canDropNum!=""){
                                    canDropNum =parseInt(oldTdObj.find(".mark").text())+1;
                                    oldTdObj.find(".mark").text(canDropNum);
                                }

                                $(this).append($("#"+dragActInCellId));
                                dragActInCellId = '';

                                if(oldTdObj.find(".act").length==0){
                                    oldTdObj.attr("_e","0");
                                }
                                $(this).attr("_e","1");
                            }
                        }
                    }

                    _this.filterAct($(this));//过滤

                }//candrop end

            })

        }, 
        dragAction:function(){
            //备选对象拖拽
            $(".plugin_actions").find(".act").on("dragstart",function(){
                $(this).addClass("actSel");console.log("drag");
                $(".plugin_actions").find(".actSel").each(function(){
                    dragActId.push($(this).attr("id"))
                });
            });

            //备选对象鼠标按下
            $(".plugin_actions").find(".act").on("mousedown",function(){
                if($(this).find(".mark").text()=="0") {
                    $(this).removeClass("actSel");
                    return false;
                }
                if($(this).hasClass("actSel")) $(this).removeClass("actSel");
                else $(this).addClass("actSel");
            });
        }


    }

    this.PluginA = _plugin_api;
})();


$(document).ready(function(){
    PluginA.init(plugin_params);
});