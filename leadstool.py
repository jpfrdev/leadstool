from flask import Flask, jsonify, render_template
from flask_restful import Resource, Api, request
from scraper.scraper import GoogleMapsScraper


app = Flask(__name__)
api = Api(app)


@app.route('/leadstool/tool', methods=['GET'])
def get_leads():
    query = request.args.get('q')
    if query is None:
        error_message = {"Error": f"Bad request."}
        return error_message, 400
    print(query)
    gms = GoogleMapsScraper()
    results = gms.crawl_results(query)
    return jsonify(results=results)


@app.route('/leadstool/', methods=['GET'])
def get_leadstool_page():
    return render_template('leadstool.html')


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001,debug=True)
