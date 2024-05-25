use pdf_canvas::{Canvas, Pdf};
use std::io;
use svg::node::element::path::Data;
use svg::node::element::Path;
use svg::Document;

pub struct Monotile {
    width: u32,
    height: u32,
    color: String,
}

impl Monotile {
    pub fn new(width: u32, height: u32, color: String) -> Self {
        Monotile {
            width,
            height,
            color,
        }
    }

    pub fn generate_svg(&self) -> Document {
        let mut data = Data::new();

        // Use the hat function to draw the pattern
        self.hat_svg(
            &mut data,
            self.width as f64 / 2.0,
            self.height as f64 / 2.0,
            0.0,
            false,
        );

        let path = Path::new()
            .set("fill", self.color.clone())
            .set("stroke", "none")
            .set("d", data);

        Document::new()
            .set("viewBox", (0, 0, self.width, self.height))
            .set("width", self.width)
            .set("height", self.height)
            .add(path)
    }

    pub fn generate_pdf(&self) -> Pdf {
        let mut pdf = Pdf::create("output.pdf").expect("Failed to create PDF");

        pdf.render_page(self.width as f32, self.height as f32, |canvas| {
            // Use the hat function to draw the pattern
            self.hat_pdf(
                canvas,
                self.width as f64 / 2.0,
                self.height as f64 / 2.0,
                0.0,
                false,
            )
            .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;
            Ok(())
        })
        .expect("Failed to render page");

        pdf
    }

    fn hat_svg(&self, data: &mut Data, _x: f64, _y: f64, _angle: f64, _flip: bool) {
        let coords = [
            (0., -1.73205081),
            (-1., -1.73205081),
            (-1.5, -2.59807),
            (-3., -1.73205081),
            (-3., 0.),
            (-4., 0.),
            (-4.5, 0.8660254),
            (-3., 1.7320508),
            (-1.5, 0.8660254),
            (-1., 1.7320508),
            (1., 1.7320508),
            (1.5, 0.8660254),
        ];

        for &(dx, dy) in &coords {
            *data = data.clone().line_by((dx, dy));
        }
        *data = data.clone().close();
    }

    fn hat_pdf(
        &self,
        canvas: &mut Canvas,
        x: f64,
        y: f64,
        _angle: f64,
        _flip: bool,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        canvas.gsave()?;
        canvas.concat(pdf_canvas::graphicsstate::Matrix::translate(
            x as f32, y as f32,
        ))?;
        canvas.concat(pdf_canvas::graphicsstate::Matrix::scale(1.0, 1.0))?;
        canvas.set_line_width(1.0)?;
        canvas.move_to(0.0, 0.0)?;

        let coords = [
            (0.0, -1.73205081),
            (-1.0, -1.73205081),
            (-1.5, -2.59807),
            (-3.0, -1.73205081),
            (-3.0, 0.0),
            (-4.0, 0.0),
            (-4.5, 0.8660254),
            (-3.0, 1.7320508),
            (-1.5, 0.8660254),
            (-1.0, 1.7320508),
            (1.0, 1.7320508),
            (1.5, 0.8660254),
        ];

        for &(dx, dy) in &coords {
            canvas.line_to(dx as f32, dy as f32)?;
        }
        canvas.close_and_stroke()?;
        canvas.fill()?;
        canvas.stroke()?;
        canvas.grestore()?;
        Ok(())
    }
}
