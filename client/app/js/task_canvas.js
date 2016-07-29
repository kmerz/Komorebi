/*jshint esversion: 6 */
import Konva from 'konva';
import Colors from './color';
import CardCanvas from './card_canvas';

class TaskCanvas extends CardCanvas {
  constructor(task, stage) {
    var layout = function() {
      var card_rect = new Konva.Rect({
        width: this.card_width,
        height: this.card_height,
        fill: Colors.light_green,
        shadowColor: 'black',
        shadowOffsetX: 5,
        shadowOffsetY: 5,
        shadowBlur: 5,
        shadowEnabled: true,
        shadowOpacity: 0.5
      });
      this.KonvaElement.add(card_rect);

      var title = new Konva.Text({
        width: this.card_width - 60,
        height: 30,
        fill: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Helvetica',
        fontStyle: 'bold',
        text: this.card.name
      });
      var new_x_title = card_rect.getWidth()/3 - title.getWidth()/3;
      title.position({x: new_x_title, y: 5});
      this.KonvaElement.add(title);

      var headerLine = new Konva.Line({
        points: [5, 23, (this.card_width - 5), 23],
        stroke: 'white',
        strokeWidth: 1,
      });
      this.KonvaElement.add(headerLine);

      var desc = new Konva.Text({
        x: 5,
        y: 50,
        width: 245,
        height: 100,
        fill: 'white',
        fontSize: 12,
        fontFamily: 'Helvetica',
        text: this.card.desc
      });
      this.KonvaElement.add(desc);

      var view_svg_path = "M11.5 9C10.12 9 9 10.12 9 11.5s1.12 " +
        "2.5 2.5 2.5 2.5-1.12 2.5-2.5S12.88 9 11.5 9zM20 4H4c-1.1 " +
        "0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 " +
        "2-2V6c0-1.1-.9-2-2-2zm-3.21 " +
        "14.21l-2.91-2.91c-.69.44-1.51.7-2.39.7C9.01 " +
        "16 7 13.99 7 11.5S9.01 7 11.5 7 16 9.01 16 " +
        "11.5c0 .88-.26 1.69-.7 2.39l2.91 2.9-1.42 1.42z";

      var view_path = new Konva.Path({
        x: card_rect.getWidth() - this.card_margin,
        y: card_rect.getHeight() - this.card_margin,
        data: view_svg_path,
        fill: 'white',
        scale: {
          x : 1,
          y : 1
        }
      });
      this.KonvaElement.add(view_path);
    };
    super(task, stage, layout, "task");
  }
}
export default TaskCanvas;